# Firebase Setup Guide for Eco-Guardian

## 🚀 Quick Start

The Firebase authentication error `auth/api-key-not-valid` means your `.env.local` file contains placeholder credentials instead of real Firebase project credentials. Follow this guide to get real credentials.

---

## 📋 Step-by-Step Setup

### Step 1: Visit Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account (create one if needed)

### Step 2: Create or Select a Project
- **If you have an existing project**: Click to select it
- **If creating new**: 
  1. Click "Create a project"
  2. Enter project name (e.g., "Eco-Guardian")
  3. Accept terms, click "Create project"
  4. Wait for setup to complete (~1 minute)

### Step 3: Set Up Web App
1. In the Firebase Console, click the **Settings icon** ⚙️ (top left)
2. Select **Project Settings**
3. Find the "Your apps" section or click the **Web icon** `</>`
4. Click "Register app" if this is your first web app
5. Enter app name (e.g., "Eco-Guardian Web")
6. Check "Also set up Firebase Hosting for this app" (optional)
7. Click "Register app"

### Step 4: Copy Firebase Configuration
After registering, you'll see your Firebase configuration. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### Step 5: Update `.env.local`
1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your real Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

### Step 6: Enable Authentication Methods
1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Click **Email/Password** provider
4. Toggle "Enable" and click "Save"
5. (Optional) Add Google, GitHub, or other providers

### Admin Accounts
Only users with the `admin` role can see the dashboard. By default every new signup is a regular user.
To promote an account:

1. Open the **Firestore Database** in the Firebase Console.
2. Navigate to the `users` collection and click the document matching the
   user's UID.
3. Edit the `role` field and change its value to `admin`.
4. Save the document.

Grant the first admin role only through the trusted Firebase Console. After
that, the rules permit an existing admin to change roles through the protected
admin dashboard. Regular users cannot change their own or anyone else's role.

After doing this, the next time that user logs in they will be able to access
`/admin/dashboard` (the admin panel).

The dashboard link appears in the navbar only for admins and requires an
admin account to reach.

### Step 7: Set Up Firestore Database (for data storage)
1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Use **Production mode** for any production project
4. Click "Create"
5. Deploy reviewed Firestore rules before allowing application traffic.

#### Collections used by Eco-Guardian
The app relies on a few top-level collections which are created automatically
when users interact with the site. You don't need to create them manually, but
it's useful to know what they are:

- `users` – holds each user's profile document with fields like `email`,
  `ecoScore`, and `role` (admin or user). See **Admin Accounts** above.
- `activities` – generic point‑earning actions (used by carbon tracker and
  others).
- `carbonActivities` – carbon-specific entries with a `co2` value.
- `wasteReports` – logged recycling/clean-up events with `type`, `amount`,
  and `location`.
- `badges` – earned achievement records.
- `leaderboard` – public display names and scores only; it does not expose
  users' email addresses or profile documents.
- `events` – community-created events and their organizer.
- `challengeMembers` – display name and membership dates for users who opt in
  to weekly eco-challenges; readable by signed-in community members.
- `products` – community marketplace listings with GHS prices and reserved
  inventory.
- `marketplaceOrders` – server-created orders; buyers, sellers, and
  administrators can read relevant orders, but only trusted Cloud Functions
  can update payment status.
- `organizationInquiries` – signed-in organization pilot inquiries, readable
  only by administrators.
- `incidentReports` – user-submitted reports; users can read their own, and
  administrators can review and update their status.
- `users/{uid}/eventRsvps` and `users/{uid}/cart` – private per-user RSVPs
  and saved cart items.
- `users/{uid}/learningProgress` – the user's quiz attempts, best score, and
  completed lesson markers for the Education Hub. Lesson content is bundled
  with the app; learning progress is private to the signed-in user. Quiz scores
  track learning only and do not award ecoScore points.

Do not copy permissive rules from tutorials into production. Rules must match
the application's actual reads and writes, validate collection fields, prevent
users from changing their own role or directly editing their score, and keep
email addresses private. The reviewed starter rules are in `firestore.rules`; required query indexes are
in `firestore.indexes.json`. `firebase.json` points Firebase CLI deployments
at both files.

To deploy the Firestore rules and indexes, install and authenticate with the Firebase CLI,
then run this from the `eco-guardian` directory, replacing the project ID:

```bash
firebase login
firebase deploy --only firestore --project YOUR_FIREBASE_PROJECT_ID
```

The rules allow signed-in users to read and create their own activity records,
and only allow score increases in the same atomic write as a valid,
points-bearing activity. The global leaderboard reads a separate projection
containing display names and scores, not private user profiles. Event listings
and product listings are shared with signed-in users; users can only edit their
own listings, RSVP records, and cart. Marketplace payment status is written
only by trusted Cloud Functions after Paystack verification.

### Marketplace checkout (Ghana Mobile Money)

Checkout uses Paystack's Ghana Mobile Money channel and charges in GHS. The
Paystack secret key is used only by Firebase Cloud Functions, never by the
browser. Buyers check out one seller at a time; payment goes to the marketplace
account, and seller payouts are handled separately by marketplace
administrators. Legacy listings labeled USD must be repriced by their owners
in GHS before they can be purchased.

1. Create/activate a Paystack merchant account registered in Ghana and enable
   Mobile Money, including MTN MoMo, in the Paystack dashboard.
2. Ensure the Firebase project is on the Blaze plan and Firebase CLI is
   authenticated to the same project. Cloud Functions and scheduled inventory
   release require billing to be enabled.
3. Set the Paystack secret (start with a test key):

   ```bash
   firebase functions:secrets:set PAYSTACK_SECRET_KEY --project YOUR_FIREBASE_PROJECT_ID
   ```

4. Create `functions/.env.YOUR_FIREBASE_PROJECT_ID` with the URL where the
   deployed marketplace returns buyers after payment:

   ```env
   MARKETPLACE_RETURN_URL=https://your-site.example/marketplace
   ```

   Use the actual HTTPS deployment URL. Do not commit this file or put the
   Paystack secret in it.
5. Deploy Firestore rules/indexes and the functions:

   ```bash
   firebase deploy --only firestore,functions --project YOUR_FIREBASE_PROJECT_ID
   ```

6. In Paystack Dashboard → Settings → API Keys & Webhooks, configure the
   webhook URL shown for the deployed `paystackWebhook` function, typically:

   ```text
   https://us-central1-YOUR_FIREBASE_PROJECT_ID.cloudfunctions.net/paystackWebhook
   ```

   Use the same test/live mode as the configured secret. Test a successful
   MTN MoMo payment, a canceled/failed payment, webhook retries, stock
   restoration after an expired checkout, and late payment after expiry (the
   latter is marked for manual refund review, not fulfilled).

Orders reserve available stock for 30 minutes while payment is pending. A
scheduled function releases expired reservations. After payment, the verified
webhook marks the order paid and removes purchased quantities from the buyer's
cart. A late successful payment is flagged `refund_required`.

Before production, test the rules in the Firebase Emulator Suite or Rules
Playground: verify that users cannot read another user's activity, cart, RSVP,
or profile; cannot directly change a score or role; and cannot modify another
user's event or product listing. Grant the first admin through the trusted
Firebase Console; only an existing admin can change roles through the protected
admin dashboard. Profile images are stored under the owning user's
`avatars/{uid}/profile` path. Storage access is restricted by `storage.rules`;
only the signed-in owner can read, replace, or delete their JPEG, PNG, or WebP
image, up to 5 MB. Incident evidence is stored separately under
`incidentEvidence/{uid}/{reportId}/{evidenceId}`. Only the reporter and
administrators can read it; the reporter can remove their evidence. Images are
limited to 8 MB each (up to two), videos to 25 MB (one per report), with at
most three files total. Evidence is not publicly listed, and download URLs are
not saved in Firestore.

Weekly community challenges count existing activity, carbon-action, and waste
report records for the current Monday-to-Sunday UTC week. Joining a challenge
shares the user's display name and app account identifier with signed-in
community members and increments the participant count; personal progress is
calculated from the user's own records and is not written to the membership
document. Deploy the updated Firestore rules and indexes before using challenge
membership:

```bash
firebase deploy --only firestore --project YOUR_FIREBASE_PROJECT_ID
```

### Step 8: Set Up Firebase Storage (for file uploads)
1. In Firebase Console, go to **Build** → **Storage**
2. Click "Get started"
3. Use **Production mode** for a production project
4. Click "Create"

`firebase.json` configures Firebase CLI to deploy the restrictive rules in
`storage.rules`. Deploy them along with Firestore rules before using profile
picture uploads, marketplace product images, or incident evidence:

```bash
firebase deploy --only firestore,storage --project YOUR_FIREBASE_PROJECT_ID
```

Do not use test rules on a production bucket.

Marketplace sellers can attach up to five JPEG, PNG, or WebP product images.
The app resizes images to at most 1,600 pixels per side and 2 MB before upload.
Only signed-in marketplace members can view them, and only the listing owner
can upload images to that listing. Product share links take recipients to the
listing after they sign in.

The `/organizations` page requires sign-in. Inquiries include the signed-in
user's email, organization details, requested pilot areas, and message. The
Firestore rules allow only the submitting user to create an inquiry and only
administrators to read them; inquiry records cannot be edited by clients.
Deploy the updated Firestore rules before accepting inquiries:

```bash
firebase deploy --only firestore --project YOUR_FIREBASE_PROJECT_ID
```

Incident evidence previews download files directly through the authenticated
Firebase Storage SDK so Storage Rules remain enforced; this requires a bucket
CORS policy. The included `storage.cors.json` allows browser GET requests from
any origin but does not grant data access—Firebase Storage Rules still control
who can read files. Apply it using Google Cloud CLI/gsutil after replacing the
bucket name with the value of `VITE_FIREBASE_STORAGE_BUCKET`:

```bash
gsutil cors set storage.cors.json gs://YOUR_FIREBASE_STORAGE_BUCKET
```

The report form accepts JPEG, PNG, WebP, MP4, and WebM. Evidence is optional.
If media upload fails after the report text is saved, the app reports that
partial result explicitly; the text report remains available in My Reports.
Image/video metadata is not stripped automatically, so submitters should check
files for embedded location or device details before attaching them.

### Step 9: Restart Development Server
```bash
# Stop the dev server (Ctrl+C)
# Then restart it:
npm run dev
```

### Step 10: Configure a Vercel Preview
1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `eco-guardian`, build command to `npm run build`,
   and output directory to `dist`.
3. Open **Project Settings** → **Environment Variables** and add the six
   `VITE_FIREBASE_...` variables shown in `.env.example`, using the values from
   your Firebase web app configuration. Select the **Preview** environment.
4. Save the variables and redeploy the preview. Vite embeds these values during
   the build, so an existing deployment will not see them until it is rebuilt.
5. Add the preview hostname to Firebase Console → **Authentication** →
   **Settings** → **Authorized domains**.

Configure these values in Vercel, not in a committed `.env` file or GitHub
source. Do not paste the values into issues, pull requests, or chat. Vite
client-side Firebase configuration is visible to users of the deployed app;
Firestore and Storage security must be enforced by Firebase rules.

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Firebase credentials copied to `.env.local`
- [ ] Dev server restarted
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] Firebase Storage created
- [ ] You can now create an account on the login page

---

## 🔑 Finding Your Credentials Later

If you lose your credentials:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Settings** ⚙️ → **Project Settings**
4. Scroll to "Your apps"
5. Click your web app
6. Find "Firebase SDK snippet" and select "Config"
7. Copy the configuration object

---

## 🚨 Common Issues

### Error: "auth/api-key-not-valid"
- **Cause**: `.env.local` has placeholder values
- **Fix**: Replace with real credentials from Firebase Console

### Error: "Firebase: Error (auth/configuration-not-found)"
- **Cause**: Firebase config not loaded properly
- **Fix**: Check `.env.local` is in project root, restart dev server

### Error: "Firebase: Error (auth/network-request-failed)"
- **Cause**: The browser could not reach Firebase Authentication, often because of a connection issue or a VPN, firewall, or browser extension blocking the request.
- **Fix**: Check your internet connection and try again. Confirm `.env.local` contains real Firebase web configuration values rather than placeholders, then restart the dev server. If the error continues, try without network filters and verify the Firebase project is available.

### Can't create account but no error message
- **Cause**: Authentication not enabled in Firebase
- **Fix**: Go to Firebase Console → Authentication → Enable Email/Password

### Credentials look correct but still getting errors
- **Cause**: Dev server cached old environment variables
- **Fix**: 
  1. Stop dev server (Ctrl+C)
  2. Delete node_modules/.vite folder (if exists)
  3. Restart dev server with `npm run dev`

---

## 🛡️ Security Notes

### Development (Current - Test Mode)
- ✅ Fine for development and testing
- ✅ Anyone can read/write data
- ⚠️ NOT secure for production

### Before Deploying to Production:
1. Change Firestore rules to production
2. Change Storage rules to production
3. Rotate API key (Firebase Console → Settings → API keys)
4. Set up environment-specific `.env` files
5. Never commit `.env.local` to git (use `.env.example` instead)

---

## 📖 Additional Resources

- [Firebase Setup Documentation](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth/web/start)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage/web)

---

## ✨ Next Steps

Once Firebase is set up:
1. ✅ Create a new account on the Sign Up page
2. ✅ Log in with your credentials
3. ✅ Explore the dashboard
4. ✅ Log activities and earn eco-points
5. ✅ Check your progress on the leaderboard

Happy eco-guarding! 🌍♻️
