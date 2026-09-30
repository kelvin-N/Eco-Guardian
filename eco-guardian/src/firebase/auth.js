import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

/**
 * Helper function to format Firebase error messages with helpful context
 */
const formatFirebaseError = (error, context = "") => {
  let errorCode = error?.code || "";
  const errorMessage = error?.message || "Unknown error";

  // some Firebase codes arrive with extra description after a space or punctuation
  // e.g. "auth/api-key-not-valid. Please pass a valid API key." – we only want the
  // canonical portion for our mapping.
  if (errorCode.includes(" ") || errorCode.includes(".")) {
    errorCode = errorCode.split(/[\s.]/)[0];
  }

  // Map of Firebase error codes to helpful messages
  const errorMap = {
    "auth/invalid-api-key": {
      title: "Firebase Configuration Error",
      message:
        "Your Firebase API key is invalid or missing. Please check your .env.local file has the correct Firebase credentials from your Firebase Console.",
      hint: "1. Go to Firebase Console → Your Project Settings → Your apps\n2. Copy the web config values\n3. Update your .env.local file with the correct values",
    },
    "auth/api-key-not-valid": {
      title: "Firebase Configuration Error",
      message: `Your Firebase API key is not valid. The credentials in .env.local appear to be placeholders or incorrect.

You can open the FIREBASE_SETUP_GUIDE.md in the project root for step-by-step instructions.`,

      hint: "1. Visit Firebase Console → Project Settings → Your apps\n2. Copy the real web configuration\n3. Replace the placeholder values in .env.local\n4. Restart the dev server",
    },
    "auth/invalid-credential": {
      title: "Invalid Email or Password",
      message: "The email address or password you entered is incorrect.",
      hint: "Please check your credentials and try again.",
    },
    "auth/user-not-found": {
      title: "User Not Found",
      message: "No account exists with this email address.",
      hint: "Please create an account first or check the email address.",
    },
    "auth/wrong-password": {
      title: "Incorrect Password",
      message: "The password you entered is incorrect.",
      hint: "Please try again or use the password reset option.",
    },
    "auth/email-already-in-use": {
      title: "Email Already Registered",
      message: "This email address is already associated with an account.",
      hint: "Try logging in instead or use a different email address.",
    },
    "auth/weak-password": {
      title: "Weak Password",
      message: "Your password is too weak. Please use at least 6 characters.",
      hint: "Include a mix of uppercase, lowercase, numbers, and symbols for better security.",
    },
    "auth/invalid-email": {
      title: "Invalid Email",
      message: "Please enter a valid email address.",
      hint: "Example: user@example.com",
    },
  };

  const errorInfo = errorMap[errorCode] || {
    title: "Authentication Error",
    message: errorMessage,
    hint: "Please try again or contact support if the problem persists.",
  };

  // Build comprehensive error message
  const fullMessage = `${errorInfo.title}${
    context ? ` (${context})` : ""
  }\n\n${errorInfo.message}\n\nTip: ${errorInfo.hint}`;

  console.error(`[Firebase Auth Error] ${errorCode}:`, error);
  return fullMessage;
};

/**
 * Create a new user account with email and password
 */
export const createUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const formattedError = formatFirebaseError(error, "Sign Up");
    console.error(formattedError);
    throw new Error(formattedError);
  }
};

/**
 * Sign in with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const formattedError = formatFirebaseError(error, "Sign In");
    console.error(formattedError);
    throw new Error(formattedError);
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const formattedError = formatFirebaseError(error, "Sign Out");
    console.error(formattedError);
    throw new Error(formattedError);
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (displayName, photoURL) => {
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });
    }
  } catch (error) {
    const formattedError = formatFirebaseError(error, "Update Profile");
    console.error(formattedError);
    throw new Error(formattedError);
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const formattedError = formatFirebaseError(error, "Password Reset");
    console.error(formattedError);
    throw new Error(formattedError);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
