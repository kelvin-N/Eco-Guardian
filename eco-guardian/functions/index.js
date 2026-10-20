import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

initializeApp();

const db = getFirestore();
const PAYSTACK_SECRET_KEY = defineSecret("PAYSTACK_SECRET_KEY");
const MARKETPLACE_RETURN_URL = defineString("MARKETPLACE_RETURN_URL", {
  default: "http://localhost:5173/marketplace",
});
const ORDER_RESERVATION_MILLISECONDS = 30 * 60 * 1000;
const PAYSTACK_API_URL = "https://api.paystack.co";

function requireSecret() {
  const secret = PAYSTACK_SECRET_KEY.value();
  if (!secret) {
    throw new HttpsError("failed-precondition", "Marketplace payments are not configured.");
  }
  return secret;
}

function pesewasFromGhs(price) {
  const pesewas = Math.round(Number(price) * 100);
  if (
    !Number.isFinite(pesewas)
    || pesewas <= 0
    || Math.abs(Number(price) * 100 - pesewas) > 0.000001
  ) {
    throw new HttpsError("failed-precondition", "A listing has an invalid GHS price.");
  }
  return pesewas;
}

function marketplaceReturnUrl() {
  let returnUrl;
  try {
    returnUrl = new URL(MARKETPLACE_RETURN_URL.value());
  } catch {
    throw new HttpsError(
      "failed-precondition",
      "Set MARKETPLACE_RETURN_URL to the deployed marketplace URL."
    );
  }
  if (returnUrl.protocol !== "https:" && returnUrl.hostname !== "localhost") {
    throw new HttpsError(
      "failed-precondition",
      "MARKETPLACE_RETURN_URL must use HTTPS outside local development."
    );
  }
  return returnUrl.toString();
}

async function paystackRequest(path, secret, options = {}) {
  const response = await fetch(`${PAYSTACK_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok || !result.status) {
    throw new Error(result.message || `Paystack request failed (${response.status}).`);
  }
  return result.data;
}

async function restoreReservedStock(transaction, order, productSnapshots) {
  for (const item of order.items) {
    const productSnapshot = productSnapshots.get(item.productId);
    if (productSnapshot?.exists) {
      const product = productSnapshot.data();
      transaction.update(productSnapshot.ref, {
        stock: product.stock + item.quantity,
        reservedStock: Math.max(0, (product.reservedStock || 0) - item.quantity),
      });
    }
  }
}

async function releaseOrderReservation(orderRef, finalStatus) {
  await db.runTransaction(async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);
    if (!orderSnapshot.exists) return;

    const order = orderSnapshot.data();
    if (!["initializing", "pending"].includes(order.status)) return;

    const productSnapshots = new Map();
    for (const item of order.items) {
      const productRef = db.collection("products").doc(item.productId);
      productSnapshots.set(item.productId, await transaction.get(productRef));
    }
    const lockRef = db.collection("users")
      .doc(order.buyerId)
      .collection("checkoutLocks")
      .doc("active");
    const lockSnapshot = await transaction.get(lockRef);

    await restoreReservedStock(transaction, order, productSnapshots);
    transaction.update(orderRef, {
      status: finalStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (lockSnapshot.exists && lockSnapshot.data().orderId === orderRef.id) {
      transaction.delete(lockRef);
    }
  });
}

async function flagOrderForRefund(orderRef) {
  await db.runTransaction(async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);
    if (!orderSnapshot.exists) return;
    const order = orderSnapshot.data();
    if (["paid", "refund_required"].includes(order.status)) return;

    const productSnapshots = new Map();
    if (["initializing", "pending"].includes(order.status)) {
      for (const item of order.items) {
        const productRef = db.collection("products").doc(item.productId);
        productSnapshots.set(item.productId, await transaction.get(productRef));
      }
    }
    const lockRef = db.collection("users")
      .doc(order.buyerId)
      .collection("checkoutLocks")
      .doc("active");
    const lockSnapshot = await transaction.get(lockRef);

    await restoreReservedStock(transaction, order, productSnapshots);
    transaction.update(orderRef, {
      status: "refund_required",
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (lockSnapshot.exists && lockSnapshot.data().orderId === orderRef.id) {
      transaction.delete(lockRef);
    }
  });
}

export const createMarketplaceCheckout = onCall(
  { secrets: [PAYSTACK_SECRET_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in before checking out.");
    }
    const buyerId = request.auth.uid;
    const buyerEmail = request.auth.token.email;
    if (!buyerEmail) {
      throw new HttpsError("failed-precondition", "Your account needs an email address for checkout.");
    }

    const cartRef = db.collection("users").doc(buyerId).collection("cart");
    const lockRef = db.collection("users")
      .doc(buyerId)
      .collection("checkoutLocks")
      .doc("active");
    const orderRef = db.collection("marketplaceOrders").doc();
    const expiresAt = Timestamp.fromMillis(Date.now() + ORDER_RESERVATION_MILLISECONDS);
    let order;

    try {
      await db.runTransaction(async (transaction) => {
        const lockSnapshot = await transaction.get(lockRef);
        if (
          lockSnapshot.exists
          && lockSnapshot.data().expiresAt.toMillis() > Date.now()
        ) {
          throw new HttpsError(
            "failed-precondition",
            "You already have a checkout in progress. Finish it or wait for it to expire."
          );
        }

        const cartSnapshot = await transaction.get(cartRef);
        if (cartSnapshot.empty) {
          throw new HttpsError("failed-precondition", "Your cart is empty.");
        }
        if (cartSnapshot.size > 20) {
          throw new HttpsError("invalid-argument", "Checkout supports up to 20 different items.");
        }

        const products = [];
        for (const cartDocument of cartSnapshot.docs) {
          const productRef = db.collection("products").doc(cartDocument.id);
          const productSnapshot = await transaction.get(productRef);
          if (!productSnapshot.exists) {
            throw new HttpsError("failed-precondition", "A cart item is no longer available.");
          }
          products.push({
            cartDocument,
            productRef,
            productSnapshot,
          });
        }

        const sellerIds = new Set(products.map(({ productSnapshot }) => productSnapshot.data().sellerId));
        if (sellerIds.size !== 1) {
          throw new HttpsError(
            "failed-precondition",
            "Check out one seller at a time. Remove items from other sellers and try again."
          );
        }
        const sellerId = [...sellerIds][0];
        if (sellerId === buyerId) {
          throw new HttpsError("failed-precondition", "You cannot purchase your own listing.");
        }

        const items = [];
        let amountPesewas = 0;
        for (const { cartDocument, productRef, productSnapshot } of products) {
          const product = productSnapshot.data();
          const quantity = cartDocument.data().quantity;
          if (
            !Number.isInteger(quantity)
            || quantity <= 0
            || quantity > product.stock
            || product.currency !== "GHS"
          ) {
            throw new HttpsError(
              "failed-precondition",
              `${product.title || "A listing"} is unavailable for Ghana mobile-money checkout.`
            );
          }

          const unitAmountPesewas = pesewasFromGhs(product.price);
          amountPesewas += unitAmountPesewas * quantity;
          items.push({
            productId: productSnapshot.id,
            title: product.title,
            quantity,
            unitAmountPesewas,
          });
          transaction.update(productRef, {
            stock: product.stock - quantity,
            reservedStock: (product.reservedStock || 0) + quantity,
          });
        }

        order = {
          buyerId,
          sellerId,
          items,
          amountPesewas,
          currency: "GHS",
          status: "initializing",
          expiresAt,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        transaction.create(orderRef, order);
        transaction.set(lockRef, {
          orderId: orderRef.id,
          expiresAt,
        });
      });

      const secret = requireSecret();
      const callbackUrl = new URL(marketplaceReturnUrl());
      callbackUrl.searchParams.set("order", orderRef.id);
      const payment = await paystackRequest("/transaction/initialize", secret, {
        method: "POST",
        body: JSON.stringify({
          email: buyerEmail,
          amount: order.amountPesewas,
          currency: "GHS",
          channels: ["mobile_money"],
          callback_url: callbackUrl.toString(),
          reference: orderRef.id,
          metadata: {
            orderId: orderRef.id,
            buyerId,
          },
        }),
      });
      if (!payment.authorization_url || !payment.reference) {
        throw new Error("Paystack did not return a checkout URL and reference.");
      }

      await orderRef.update({
        status: "pending",
        paymentReference: payment.reference,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { checkoutUrl: payment.authorization_url };
    } catch (error) {
      try {
        await releaseOrderReservation(orderRef, "payment_initialization_failed");
      } catch (releaseError) {
        logger.error("Failed to release marketplace inventory after checkout error.", {
          orderId: orderRef.id,
          error: releaseError,
        });
      }
      if (error instanceof HttpsError) throw error;
      logger.error("Marketplace checkout initialization failed.", {
        orderId: orderRef.id,
        error,
      });
      throw new HttpsError("internal", "Checkout could not be started. Please try again.");
    }
  }
);

export const paystackWebhook = onRequest(
  { secrets: [PAYSTACK_SECRET_KEY], timeoutSeconds: 60 },
  async (request, response) => {
    if (request.method !== "POST") {
      response.set("Allow", "POST").status(405).send("Method not allowed.");
      return;
    }

    const rawBody = request.rawBody;
    const signature = request.get("x-paystack-signature");
    if (!rawBody || !signature) {
      response.status(400).send("Missing signed Paystack event.");
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY.value())
      .update(rawBody)
      .digest("hex");
    const received = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");
    if (
      received.length !== expected.length
      || !crypto.timingSafeEqual(received, expected)
    ) {
      response.status(401).send("Invalid Paystack signature.");
      return;
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      response.status(400).send("Invalid event payload.");
      return;
    }
    if (event.event !== "charge.success") {
      response.status(200).send("Event ignored.");
      return;
    }

    const orderId = event.data?.metadata?.orderId;
    const reference = event.data?.reference;
    if (typeof orderId !== "string" || typeof reference !== "string") {
      response.status(400).send("Missing order metadata.");
      return;
    }

    try {
      const secret = PAYSTACK_SECRET_KEY.value();
      const payment = await paystackRequest(
        `/transaction/verify/${encodeURIComponent(reference)}`,
        secret
      );
      const orderRef = db.collection("marketplaceOrders").doc(orderId);
      const orderSnapshot = await orderRef.get();
      if (!orderSnapshot.exists) {
        response.status(404).send("Order not found.");
        return;
      }
      const order = orderSnapshot.data();
      const paymentPaidAt = Date.parse(payment.paid_at || "");
      if (payment.status !== "success") {
        logger.error("Paystack reported a successful event but verification was not successful.", {
          orderId,
          reference,
        });
        response.status(500).send("Payment verification will be retried.");
        return;
      }
      if (
        order.paymentReference !== reference
        || payment.currency !== order.currency
        || payment.amount !== order.amountPesewas
        || !Number.isFinite(paymentPaidAt)
      ) {
        logger.error("Paystack payment did not match its marketplace order.", { orderId, reference });
        await flagOrderForRefund(orderRef);
        response.status(200).send("Payment does not match the order; manual review required.");
        return;
      }

      await db.runTransaction(async (transaction) => {
        const currentSnapshot = await transaction.get(orderRef);
        if (!currentSnapshot.exists) return;
        const currentOrder = currentSnapshot.data();
        if (currentOrder.status === "paid") return;
        const paidAfterReservation = paymentPaidAt > currentOrder.expiresAt.toMillis();
        if (currentOrder.status !== "pending" || paidAfterReservation) {
          if (
            currentOrder.status === "pending"
            && paidAfterReservation
          ) {
            const productSnapshots = new Map();
            for (const item of currentOrder.items) {
              const productRef = db.collection("products").doc(item.productId);
              productSnapshots.set(item.productId, await transaction.get(productRef));
            }
            const lockRef = db.collection("users")
              .doc(currentOrder.buyerId)
              .collection("checkoutLocks")
              .doc("active");
            const lockSnapshot = await transaction.get(lockRef);
            await restoreReservedStock(transaction, currentOrder, productSnapshots);
            transaction.update(orderRef, {
              status: "refund_required",
              updatedAt: FieldValue.serverTimestamp(),
            });
            if (lockSnapshot.exists && lockSnapshot.data().orderId === orderRef.id) {
              transaction.delete(lockRef);
            }
          } else if (["expired", "payment_initialization_failed"].includes(currentOrder.status)) {
            transaction.update(orderRef, {
              status: "refund_required",
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
          return;
        }

        const productSnapshots = new Map();
        for (const item of currentOrder.items) {
          const productRef = db.collection("products").doc(item.productId);
          productSnapshots.set(item.productId, await transaction.get(productRef));
        }
        const cartRefs = currentOrder.items.map(({ productId }) => (
          db.collection("users")
            .doc(currentOrder.buyerId)
            .collection("cart")
            .doc(productId)
        ));
        const cartSnapshots = [];
        for (const cartRef of cartRefs) {
          cartSnapshots.push(await transaction.get(cartRef));
        }
        const lockRef = db.collection("users")
          .doc(currentOrder.buyerId)
          .collection("checkoutLocks")
          .doc("active");
        const lockSnapshot = await transaction.get(lockRef);

        transaction.update(orderRef, {
          status: "paid",
          paidAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        currentOrder.items.forEach((item, index) => {
          const productSnapshot = productSnapshots.get(item.productId);
          if (productSnapshot?.exists) {
            transaction.update(productSnapshot.ref, {
              reservedStock: Math.max(
                0,
                (productSnapshot.data().reservedStock || 0) - item.quantity
              ),
            });
          }
          const cartSnapshot = cartSnapshots[index];
          if (!cartSnapshot.exists) return;
          const currentQuantity = cartSnapshot.data().quantity;
          if (currentQuantity <= item.quantity) {
            transaction.delete(cartRefs[index]);
          } else {
            transaction.update(cartRefs[index], {
              quantity: currentQuantity - item.quantity,
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        });
        if (lockSnapshot.exists && lockSnapshot.data().orderId === orderRef.id) {
          transaction.delete(lockRef);
        }
      });
      response.status(200).send("Payment processed.");
    } catch (error) {
      logger.error("Failed to process Paystack marketplace webhook.", { orderId, error });
      response.status(500).send("Webhook processing failed.");
    }
  }
);

export const expireMarketplaceReservations = onSchedule(
  "every 15 minutes",
  async () => {
    const now = Timestamp.now();
    for (const status of ["pending", "initializing"]) {
      const expiredOrders = await db.collection("marketplaceOrders")
        .where("status", "==", status)
        .where("expiresAt", "<=", now)
        .orderBy("expiresAt", "asc")
        .limit(100)
        .get();
      for (const orderDocument of expiredOrders.docs) {
        await releaseOrderReservation(orderDocument.ref, "expired");
      }
    }
  }
);
