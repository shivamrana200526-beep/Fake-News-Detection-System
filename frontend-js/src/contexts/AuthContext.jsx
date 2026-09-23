import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on load
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("satyacheck_user");
      const savedToken = localStorage.getItem("satyacheck_token");

      if (savedUser && savedToken) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token expired or invalid
            setUser(JSON.parse(savedUser));
          }
        } catch {
          try {
            setUser(JSON.parse(savedUser));
          } catch {}
        }
      }

      // If Firebase is configured with real keys, also listen to Firebase auth
      if (isFirebaseConfigured && auth) {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            await loginWithGoogle({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || "Google User",
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            });
          }
          setLoading(false);
        });
        return () => unsubscribe();
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // 1. Real Email + Password Sign In
  const loginWithEmail = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to sign in");
    }

    setUser(data.user);
    localStorage.setItem("satyacheck_user", JSON.stringify(data.user));
    localStorage.setItem("satyacheck_token", data.token);
    return data.user;
  };

  // 2. Real Email + Password Registration
  const registerWithEmail = async (name, email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create account");
    }

    setUser(data.user);
    localStorage.setItem("satyacheck_user", JSON.stringify(data.user));
    localStorage.setItem("satyacheck_token", data.token);
    return data.user;
  };

  // 3. Google Sign-In (Syncs with backend audit database)
  const loginWithGoogle = async (googleProfile) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleProfile),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to sign in with Google");
    }

    setUser(data.user);
    localStorage.setItem("satyacheck_user", JSON.stringify(data.user));
    localStorage.setItem("satyacheck_token", data.token);
    return data.user;
  };

  // 4. Trigger Native Firebase Popup if configured
  const triggerFirebaseGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const result = await signInWithPopup(auth, googleProvider);
      return await loginWithGoogle({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
    }
    throw new Error("FIREBASE_NOT_CONFIGURED");
  };

  // 5. Sign Out
  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch {}
    }
    setUser(null);
    localStorage.removeItem("satyacheck_user");
    localStorage.removeItem("satyacheck_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        triggerFirebaseGoogle,
        signOut,
        isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from "@/hooks/use-auth";
