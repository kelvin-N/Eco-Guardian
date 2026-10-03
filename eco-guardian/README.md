# 🌍 Eco-Guardian

Eco-Guardian is a mobile application designed to encourage sustainable living by tracking eco-friendly activities and rewarding users with points.

## 🚀 Features

- 🔐 Firebase Authentication
- 📊 Real-time Dashboard for users
- 🌱 Eco Tips
- 📝 Activity Log (earn points)
- 🔥 Firebase Firestore integration
- 🛡️ **Admin Dashboard** (role-based access)
  - Manage users and roles
  - View system statistics
  - Promote/demote accounts


## 🛠️ Tech Stack

- React web aplication
- TypeScript
- Firebase Authentication
- Firebase Firestore

## 📂 Project Structure

eco-guardian/
│
├── app/
├── components/
├── firebase/
├── assets/
└── README.md

## 📦 Installation

```bash
npm install
npm run dev
```

## Vercel Preview Deployment

1. Import this GitHub repository into Vercel and set the **Root Directory** to
   `eco-guardian`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. In **Project Settings → Environment Variables**, add the six Firebase
   variables listed in [`.env.example`](./.env.example):
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
   `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
   `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`.
   Select **Preview** for a preview deployment. Set them for **Production**
   separately when preparing a production release.
4. Redeploy after adding or changing variables; Vite reads them at build time.
5. Add the deployed site's hostname to Firebase Authentication's authorized
   domains.

Do not commit `.env` or `.env.local`, or put Firebase values in GitHub source
files. Configure values in Vercel's environment settings; local environment
files are ignored by Git. See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)
for Firebase configuration and security-rule guidance.