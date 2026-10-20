/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, firebaseConfigurationError, isFirebaseConfigured } from "../firebase/firebaseConfig";
import { createUserProfile } from "../services/ecoService";
import {
  createUser,
  loginUser,
  logoutUser,
  updateUserProfile,
} from "../firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    let unsubscribeProfile;
    const unsubscribeAuth = onAuthStateChanged(auth, (authenticatedUser) => {
      unsubscribeProfile?.();
      setUser(authenticatedUser);

      if (!authenticatedUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      createUserProfile(authenticatedUser.uid, authenticatedUser.email).catch((error) => {
        console.error("Failed to initialize user profile:", error);
      });

      const fallbackProfile = {
        uid: authenticatedUser.uid,
        email: authenticatedUser.email,
        displayName: authenticatedUser.displayName || authenticatedUser.email?.split("@")[0] || "User",
        role: "user",
      };

      if (!db) {
        setUserProfile(fallbackProfile);
        setLoading(false);
        return;
      }

      unsubscribeProfile = onSnapshot(
        doc(db, "users", authenticatedUser.uid),
        (profileSnapshot) => {
          if (profileSnapshot.exists()) {
            setUserProfile({ ...fallbackProfile, ...profileSnapshot.data() });
          } else {
            setUserProfile(fallbackProfile);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Failed to load user profile:", error);
          setUserProfile(fallbackProfile);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile?.();
    };
  }, []);

  const login = async (email, password) => {
    if (!isFirebaseConfigured) throw new Error(firebaseConfigurationError);
    await loginUser(email, password);
    return true;
  };

  const signup = async (email, password) => {
    if (!isFirebaseConfigured) throw new Error(firebaseConfigurationError);
    const newUser = await createUser(email, password);
    await createUserProfile(newUser.uid, newUser.email);
    return true;
  };

  const logout = async () => {
    if (!auth) throw new Error(firebaseConfigurationError);
    await logoutUser();
  };

  const updateProfile = async (displayName, photoURL) => {
    const profileChanges = {};
    if (displayName !== undefined) profileChanges.displayName = displayName;
    if (photoURL !== undefined) profileChanges.photoURL = photoURL;
    if (Object.keys(profileChanges).length === 0) return;
    await updateUserProfile(profileChanges);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        userProfile,
        loading,
        configurationError: firebaseConfigurationError,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);