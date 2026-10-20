import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import {
  addProductToCart,
  createMarketplaceCheckout,
  createProductListing,
  getProductListings,
  getUserCart,
  getUserMarketplaceOrders,
  removeProductFromCart,
  updateProductListing,
} from "../../services/communityService";
import {
  validateMarketplaceProductImages,
} from "../../firebase/storage";

const CATEGORIES = ["Reusable", "Home", "Garden", "Personal care", "Other"];
const EMPTY_PRODUCT = {
  title: "",
  description: "",
  category: "Reusable",
  price: "",
  stock: "1",
};
const ghsCurrency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "GHS",
});
const usdCurrency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

export default function Marketplace() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const [searchParams] = useSearchParams();
  const sharedProductId = searchParams.get("product");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const imagePreviewUrls = useRef([]);
  const [editingListing, setEditingListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [busyProductId, setBusyProductId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadMarketplace = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nextProducts, nextCart, nextOrders] = await Promise.all([
        getProductListings(),
        getUserCart(userId),
        getUserMarketplaceOrders(userId),
      ]);
      setProducts(nextProducts);
      setCart(nextCart);
      setOrders(nextOrders);
      setError("");
    } catch (loadError) {
      console.error("Failed to load marketplace:", loadError);
      setError(loadError.message || "Marketplace could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMarketplace();
  }, [loadMarketplace]);

  useEffect(() => () => {
    imagePreviewUrls.current.forEach((preview) => URL.revokeObjectURL(preview));
  }, []);

  useEffect(() => {
    if (loading || !sharedProductId) return;
    const listing = products.find((product) => product.id === sharedProductId);
    if (listing) {
      document.getElementById(`product-${sharedProductId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else if (products.length > 0) {
      setMessage("The shared listing is no longer available.");
    }
  }, [loading, products, sharedProductId]);

  useEffect(() => {
    const returnedOrder = new URLSearchParams(window.location.search).get("order");
    if (returnedOrder) {
      setPaymentOrderId(returnedOrder);
      setMessage("Payment started. Mobile Money confirmation may take a few moments; check your order status below.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!paymentOrderId || !userId) return undefined;

    let cancelled = false;
    let attempts = 0;
    let timeoutId;
    const refreshOrderStatus = async () => {
      try {
        const nextOrders = await getUserMarketplaceOrders(userId);
        if (cancelled) return;
        setOrders(nextOrders);
        const order = nextOrders.find((candidate) => candidate.id === paymentOrderId);
        if (order && order.status !== "pending" && order.status !== "initializing") {
          if (order.status === "paid") {
            setMessage("Payment confirmed. Your order is paid.");
          } else if (order.status === "refund_required") {
            setMessage("Paystack confirmed payment after the reservation expired. Contact the marketplace administrator for a refund.");
          }
          return;
        }
      } catch (refreshError) {
        console.error("Failed to refresh marketplace order status:", refreshError);
        setError("Order status could not be refreshed. Try reloading the marketplace.");
      }

      attempts += 1;
      if (!cancelled && attempts < 12) {
        timeoutId = window.setTimeout(refreshOrderStatus, 5000);
      }
    };
    timeoutId = window.setTimeout(refreshOrderStatus, 3000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [paymentOrderId, userId]);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );
  const cartEntries = cart.map((item) => ({
    ...item,
    product: productsById.get(item.productId),
  }));
  const cartItems = cartEntries.filter((item) => item.product);
  const cartTotal = cartItems.reduce(
    (total, item) => total + Math.round(item.product.price * 100) * item.quantity,
    0
  );
  const cartSellerIds = new Set(cartItems.map((item) => item.product.sellerId));
  const hasLegacyListing = cartItems.some((item) => item.product.currency !== "GHS");
  const canCheckout = cart.length > 0
    && cart.length === cartItems.length
    && cartSellerIds.size === 1
    && !hasLegacyListing;

  const formatProductPrice = (product) => (
    (product.currency === "GHS" ? ghsCurrency : usdCurrency).format(product.price)
  );

  const handleProductImagesChange = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    try {
      validateMarketplaceProductImages(files);
      imagePreviewUrls.current.forEach((preview) => URL.revokeObjectURL(preview));
      imagePreviewUrls.current = files.map((file) => URL.createObjectURL(file));
      setProductImages(files);
      setImagePreviews(imagePreviewUrls.current);
      setError("");
    } catch (imageError) {
      setError(imageError.message || "Product images are invalid.");
    }
  };

  const handleRemoveProductImage = (index) => {
    URL.revokeObjectURL(imagePreviewUrls.current[index]);
    imagePreviewUrls.current = imagePreviewUrls.current.filter((_, imageIndex) => imageIndex !== index);
    setProductImages((previous) => previous.filter((_, imageIndex) => imageIndex !== index));
    setImagePreviews((previous) => previous.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!userId) {
      setError("Sign in to create a product listing.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isFinite(price) || price <= 0 || price > 100000) {
      setError("Enter a GHS price greater than zero and no more than GHS 100,000.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 1 || stock > 1000) {
      setError("Stock must be a whole number from 1 to 1,000.");
      return;
    }

    setSubmitting(true);
    try {
      await createProductListing(userId, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price,
        stock,
      }, productImages);
      setForm(EMPTY_PRODUCT);
      imagePreviewUrls.current.forEach((preview) => URL.revokeObjectURL(preview));
      imagePreviewUrls.current = [];
      setProductImages([]);
      setImagePreviews([]);
      setMessage("Your listing is now available in the community marketplace.");
      await loadMarketplace();
    } catch (createError) {
      console.error("Failed to create product listing:", createError);
      setError(createError.message || "Your listing could not be published.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareProduct = async (product) => {
    const shareUrl = new URL("/marketplace", window.location.origin);
    shareUrl.searchParams.set("product", product.id);
    const shareData = {
      title: product.title,
      text: `${product.title} — ${formatProductPrice(product)} on Eco-Guardian Marketplace`,
      url: shareUrl.toString(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
      } else {
        throw new Error("Sharing is not available in this browser.");
      }
      setMessage(navigator.share ? "Product shared." : "Product link copied to clipboard.");
      setError("");
    } catch (shareError) {
      if (shareError.name === "AbortError") return;
      console.error("Failed to share product:", shareError);
      setError(shareError.message || "This product could not be shared.");
    }
  };

  const handleAddToCart = async (product) => {
    if (!userId) return;
    setBusyProductId(product.id);
    setError("");
    setMessage("");
    try {
      await addProductToCart(userId, product.id);
      setMessage(`${product.title} added to your cart.`);
      await loadMarketplace();
    } catch (cartError) {
      console.error("Failed to add product to cart:", cartError);
      setError(cartError.message || "This item could not be added to your cart.");
    } finally {
      setBusyProductId("");
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!userId) return;
    setBusyProductId(productId);
    setError("");
    setMessage("");
    try {
      await removeProductFromCart(userId, productId);
      setCart((previous) => previous.filter((item) => item.productId !== productId));
      setMessage("Item removed from your cart.");
    } catch (removeError) {
      console.error("Failed to remove product from cart:", removeError);
      setError(removeError.message || "This item could not be removed from your cart.");
    } finally {
      setBusyProductId("");
    }
  };

  const handleCheckout = async () => {
    setError("");
    setMessage("");
    setCheckoutBusy(true);
    try {
      const checkoutUrl = await createMarketplaceCheckout();
      window.location.assign(checkoutUrl);
    } catch (checkoutError) {
      console.error("Failed to start marketplace checkout:", checkoutError);
      setError(checkoutError.message || "Checkout could not be started.");
      setCheckoutBusy(false);
    }
  };

  const handleUpdateListing = async (event) => {
    event.preventDefault();
    const price = Number(editingListing.price);
    const stock = Number(editingListing.stock);
    if (!Number.isFinite(price) || price < 0.01 || price > 100000) {
      setError("Enter a GHS price greater than zero and no more than GHS 100,000.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0 || stock > 1000) {
      setError("Stock must be a whole number from 0 to 1,000.");
      return;
    }

    setBusyProductId(editingListing.productId);
    setError("");
    setMessage("");
    try {
      await updateProductListing(editingListing.productId, { price, stock });
      setEditingListing(null);
      setMessage("Listing updated in GHS and available for Mobile Money checkout.");
      await loadMarketplace();
    } catch (updateError) {
      console.error("Failed to update product listing:", updateError);
      setError(updateError.message || "Your listing could not be updated.");
    } finally {
      setBusyProductId("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container">
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="eco-heading-xl mb-2">🛍️ Community Eco Marketplace</h1>
            <p className="eco-text-muted mb-6">
              Discover community-listed sustainable goods, pay with Ghana Mobile Money, or share a product of your own. Product links open the listing for signed-in community members.
            </p>

            {(error || message) && (
              <p className={error ? "eco-alert-error mb-6" : "eco-alert-success mb-6"} role={error ? "alert" : "status"}>
                {error || message}
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
              <section>
                <h2 className="eco-heading-lg mb-4">Community listings</h2>
                {loading ? (
                  <div className="flex justify-center py-16"><Loader size="lg" /></div>
                ) : products.length === 0 ? (
                  <Card>
                    <p className="eco-text-muted">No products listed yet. Add the first sustainable product for the community.</p>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {products.map((product) => {
                      const inCart = cart.find((item) => item.productId === product.id);
                      const isSeller = product.sellerId === userId;
                      return (
                        <Card
                          key={product.id}
                          id={`product-${product.id}`}
                          className={sharedProductId === product.id ? "ring-2 ring-eco-500" : ""}
                        >
                          {product.images?.length > 0 ? (
                            <div className="mb-4 grid grid-cols-2 gap-2">
                              {product.images.slice(0, 5).map((image, index) => (
                                <img
                                  key={image.path || image.url}
                                  src={image.url}
                                  alt={`${product.title}${index === 0 ? "" : ` photo ${index + 1}`}`}
                                  className={`h-40 w-full rounded-lg object-cover ${index === 0 && product.images.length > 1 ? "row-span-2 h-full min-h-40" : ""} ${product.images.length === 1 ? "col-span-2" : ""}`}
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="mb-4 flex h-36 items-center justify-center rounded-lg bg-eco-50 text-4xl dark:bg-eco-900/20" aria-label="No product image">
                              🌿
                            </div>
                          )}
                          <p className="text-xs font-semibold uppercase tracking-wide text-eco-700 dark:text-eco-300">
                            {product.category}
                          </p>
                          <h3 className="eco-heading-md mt-2">{product.title}</h3>
                          <p className="mt-2 min-h-12 text-sm eco-text-muted">{product.description}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleShareProduct(product)}
                          >
                            Share product
                          </Button>
                          <div className="mt-4 flex items-baseline justify-between gap-2">
                            <span className="text-lg font-bold text-eco-700 dark:text-eco-300">
                              {formatProductPrice(product)}
                            </span>
                            <span className="text-xs eco-text-subtle">
                              {product.stock} in stock
                            </span>
                          </div>
                          {isSeller ? (
                            <div className="mt-4 space-y-3">
                              <p className="text-sm eco-text-muted">
                                {product.currency === "GHS"
                                  ? "Your listing"
                                  : "This legacy USD listing needs a GHS price before it can be purchased."}
                              </p>
                              {editingListing?.productId === product.id ? (
                                <form onSubmit={handleUpdateListing} className="space-y-3">
                                  <label className="block text-sm font-medium">
                                    Price (GHS)
                                    <input
                                      required
                                      type="number"
                                      min="0.01"
                                      max="100000"
                                      step="0.01"
                                      value={editingListing.price}
                                      onChange={(event) => setEditingListing({
                                        ...editingListing,
                                        price: event.target.value,
                                      })}
                                      className="eco-input mt-2"
                                    />
                                  </label>
                                  <label className="block text-sm font-medium">
                                    Stock
                                    <input
                                      required
                                      type="number"
                                      min="0"
                                      max="1000"
                                      step="1"
                                      value={editingListing.stock}
                                      onChange={(event) => setEditingListing({
                                        ...editingListing,
                                        stock: event.target.value,
                                      })}
                                      className="eco-input mt-2"
                                    />
                                  </label>
                                  <div className="flex gap-2">
                                    <Button type="submit" size="sm" disabled={busyProductId === product.id}>
                                      Save GHS listing
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingListing(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingListing({
                                    productId: product.id,
                                    price: product.currency === "GHS" ? String(product.price) : "",
                                    stock: String(product.stock),
                                  })}
                                >
                                  {product.currency === "GHS" ? "Edit price or stock" : "Update price to GHS"}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              type="button"
                              className="mt-4 w-full"
                              variant="outline"
                              disabled={
                                busyProductId === product.id
                                || product.stock <= 0
                                || inCart?.quantity >= product.stock
                                || product.currency !== "GHS"
                              }
                              onClick={() => handleAddToCart(product)}
                            >
                              {product.currency !== "GHS"
                                ? "Unavailable until repriced in GHS"
                                : product.stock <= 0
                                  ? "Sold out"
                                  : busyProductId === product.id
                                ? "Adding..."
                                : inCart
                                  ? `Add another (${inCart.quantity} in cart)`
                                  : "Add to cart"}
                            </Button>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>

              <div className="space-y-6">
                <Card>
                  <h2 className="eco-heading-lg mb-4">Your cart</h2>
                  {cart.length === 0 ? (
                    <p className="eco-text-muted text-sm">Your cart is empty.</p>
                  ) : (
                    <>
                      <ul className="space-y-3">
                        {cartEntries.map((item) => (
                          <li key={item.productId} className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3 dark:border-gray-700">
                            <div>
                              <p className="font-medium">{item.product?.title || "Unavailable listing"}</p>
                              <p className="text-sm eco-text-muted">
                                {item.product
                                  ? `${item.quantity} × ${formatProductPrice(item.product)}`
                                  : "This listing is no longer available. Remove it to continue."}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="text-sm text-red-600 hover:underline dark:text-red-400"
                              disabled={busyProductId === item.productId}
                              onClick={() => handleRemoveFromCart(item.productId)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                      {canCheckout && (
                        <p className="mt-4 flex justify-between font-semibold">
                          <span>Order total</span>
                          <span>{ghsCurrency.format(cartTotal / 100)}</span>
                        </p>
                      )}
                      {hasLegacyListing && (
                        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                          A seller must update each legacy USD listing to a GHS price before it can be checked out.
                        </p>
                      )}
                      {cartSellerIds.size > 1 && (
                        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                          Checkout is limited to one seller at a time. Remove items from other sellers to continue.
                        </p>
                      )}
                      <Button
                        type="button"
                        className="mt-4 w-full"
                        disabled={!canCheckout || checkoutBusy || busyProductId !== ""}
                        loading={checkoutBusy}
                        onClick={handleCheckout}
                      >
                        {checkoutBusy ? "Connecting to Paystack..." : "Pay with Mobile Money"}
                      </Button>
                    </>
                  )}
                  <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                    Checkout is processed securely by Paystack in GHS. Payment goes to the marketplace account; seller payouts and delivery are arranged separately by the marketplace.
                  </p>
                </Card>

                <Card>
                  <h2 className="eco-heading-lg mb-4">Your orders</h2>
                  {orders.length === 0 ? (
                    <p className="eco-text-muted text-sm">Your completed and pending orders will appear here.</p>
                  ) : (
                    <ul className="space-y-4">
                      {orders.map((order) => (
                        <li key={order.id} className="border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">
                                {order.items.map((item) => `${item.title} × ${item.quantity}`).join(", ")}
                              </p>
                              <p className="mt-1 text-sm eco-text-muted">
                                {ghsCurrency.format(order.amountPesewas / 100)}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs font-semibold capitalize text-eco-700 dark:text-eco-300">
                              {order.status.replaceAll("_", " ")}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card>
                  <h2 className="eco-heading-lg mb-2">List a product</h2>
                  <p className="eco-text-muted mb-4 text-sm">
                    Listings are shared with signed-in community members.
                  </p>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <label className="block text-sm font-medium">
                      Product name
                      <input
                        required
                        maxLength={100}
                        value={form.title}
                        onChange={(event) => setForm({ ...form, title: event.target.value })}
                        className="eco-input mt-2"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Description
                      <textarea
                        maxLength={1000}
                        rows={3}
                        value={form.description}
                        onChange={(event) => setForm({ ...form, description: event.target.value })}
                        className="eco-input mt-2"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Category
                      <select
                        value={form.category}
                        onChange={(event) => setForm({ ...form, category: event.target.value })}
                        className="eco-input mt-2"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </label>
                    <div>
                      <label htmlFor="marketplace-product-images" className="block text-sm font-medium">
                        Product photos (up to 5)
                      </label>
                      <input
                        id="marketplace-product-images"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleProductImagesChange}
                        className="eco-input mt-2"
                      />
                      <p className="mt-1 text-xs eco-text-subtle">
                        JPEG, PNG, or WebP; up to 10 MB each. Images are resized before upload.
                      </p>
                      {imagePreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={preview} className="relative">
                              <img
                                src={preview}
                                alt={`Product photo preview ${index + 1}`}
                                className="h-20 w-full rounded-md object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveProductImage(index)}
                                className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white"
                                aria-label={`Remove product photo ${index + 1}`}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-sm font-medium">
                        Price (GHS)
                        <input
                          required
                          type="number"
                          min="0.01"
                          max="100000"
                          step="0.01"
                          value={form.price}
                          onChange={(event) => setForm({ ...form, price: event.target.value })}
                          className="eco-input mt-2"
                        />
                      </label>
                      <label className="block text-sm font-medium">
                        Stock
                        <input
                          required
                          type="number"
                          min="1"
                          max="1000"
                          step="1"
                          value={form.stock}
                          onChange={(event) => setForm({ ...form, stock: event.target.value })}
                          className="eco-input mt-2"
                        />
                      </label>
                    </div>
                    <Button type="submit" disabled={submitting} loading={submitting}>
                      {submitting ? "Publishing..." : "Publish listing"}
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
