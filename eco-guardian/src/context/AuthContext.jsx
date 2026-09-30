/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const STORAGE_KEY = "eco-guardian-demo-user";
const PROFILE_KEY = "eco-guardian-demo-profile";

export function AuthProvider({ children }) {
  const demoUser = {
    uid: "demo-user-001",
    email: "demo@ecoguidance.com",
    displayName: "Demo User",
    role: "user",
  };

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const savedUser = localStorage.getItem(STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window === "undefined") return null;
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userProfile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  }, [userProfile]);

  const createDemoProfile = (emailValue) => ({
    uid: demoUser.uid,
    email: emailValue || demoUser.email,
    displayName: (emailValue || demoUser.email).split("@")[0],
    role: "user",
  });

  // LOGIN (demo mode)
  const login = async (email, password) => {
    setLoading(true);

    await new Promise((res) => setTimeout(res, 500));

    const emailValue = email || demoUser.email;
    const nextUser = {
      ...demoUser,
      email: emailValue,
      displayName: (emailValue || demoUser.email).split("@")[0],
    };

    const profile = createDemoProfile(emailValue);
    setUser(nextUser);
    setUserProfile(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
    setLoading(false);
    return true;
  };

  // SIGNUP (demo mode)
  const signup = async (email, password) => {
    setLoading(true);

    await new Promise((res) => setTimeout(res, 500));

    const emailValue = email || demoUser.email;
    const nextUser = {
      ...demoUser,
      email: emailValue,
      displayName: (emailValue || demoUser.email).split("@")[0],
      role: "user",
    };

    setUser(nextUser);
    const profile = createDemoProfile(emailValue);
    setUserProfile(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
    setLoading(false);
    return true;
  };

  // LOGOUT
  const logout = async () => {
    setUser(null);
    setUserProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROFILE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        userProfile,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);