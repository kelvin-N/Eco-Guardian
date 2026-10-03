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

Do not copy permissive rules from tutorials into production. Rules must match
the application's actual reads and writes, validate collection fields, prevent
users from changing their own role or score, and restrict personal data to
authorized readers. The starter rules are in `firestore.rules`. Review them,
then copy their contents into the Firestore **Rules** editor and use **Test**
to confirm that a signed-in user can create and read their own profile, cannot
read another user's profile, and cannot change a score or role. Deploy only
after those checks pass.

These rules intentionally deny client access to all collections other than
user profiles. Activity logging, badges, score updates, and the leaderboard
will remain unavailable until those features use a trusted backend and have
their own reviewed rules. Grant the first admin through the trusted Firebase
Console; only an existing admin can change roles through the protected admin
dashboard. Storage has separate rules and is not configured by this file.

### Step 8: Set Up Firebase Storage (for file uploads)
1. In Firebase Console, go to **Build** → **Storage**
2. Click "Get started"
3. Use **Production mode** for a production project
4. Click "Create"

Deploy Storage rules that restrict uploads and reads to the authenticated
owner. Do not use test rules on a production bucket.

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
