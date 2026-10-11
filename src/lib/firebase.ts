import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from "firebase/auth";

// Environment variables for Firebase Web App
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "your-firebase-api-key" &&
    firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    console.log("🔥 Firebase Web Client initialized successfully!");
  } catch (err) {
    console.warn("Firebase client initialization warning:", err);
  }
} else {
  console.info(
    "ℹ️ Firebase config is pending in .env (VITE_FIREBASE_API_KEY). Using secure backend authentication with rate limiting and server-side validation."
  );
}

export { auth };

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    readinessScore?: number;
  };
  token?: string;
  error?: string;
  retryAfterSeconds?: number;
  remainingAttempts?: number;
}

/**
 * Perform login using Firebase Auth if configured, verified against the secure backend.
 */
export async function authenticateWithFirebaseOrBackend(
  email: string,
  pass: string,
  role: string
): Promise<AuthResult> {
  const backendBase =
    (import.meta as any).env?.VITE_API_URL ||
    ((import.meta as any).env?.PROD ? "/api" : "http://localhost:3001/api");

  // If live Firebase Client is active
  if (isFirebaseConfigured && auth) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await userCred.user.getIdToken();

      // Verify token on backend with rate limiting & server validation
      const verifyRes = await fetch(`${backendBase}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role }),
      });

      const data = await verifyRes.json();
      if (!verifyRes.ok) {
        return {
          success: false,
          error: data.error || "Authentication failed. Please verify your credentials.",
          retryAfterSeconds: data.retryAfterSeconds,
        };
      }

      localStorage.setItem("skill-token", idToken);
      return {
        success: true,
        user: data.user,
        token: idToken,
      };
    } catch (firebaseErr: any) {
      console.warn("Firebase sign-in attempted:", firebaseErr?.code);
      // Generic error response - do not differentiate between user not found or wrong password
      return {
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      };
    }
  }

  // Direct secure backend login (Rate-limited, server-side validated, generic errors)
  try {
    const res = await fetch(`${backendBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Invalid email or password. Please verify your credentials.",
        retryAfterSeconds: data.retryAfterSeconds,
        remainingAttempts: data.remainingAttempts,
      };
    }

    if (data.token) {
      localStorage.setItem("skill-token", data.token);
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (err: any) {
    console.error("Backend login network error:", err);
    return {
      success: false,
      error: "Unable to connect to authentication server. Please check your network connection.",
    };
  }
}

/**
 * Register a new user with Firebase
 */
export async function registerWithFirebase(
  email: string,
  pass: string,
  role: string
): Promise<AuthResult> {
  if (isFirebaseConfigured && auth) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      const idToken = await userCred.user.getIdToken();

      return {
        success: true,
        user: {
          id: userCred.user.uid,
          email: userCred.user.email || email,
          name: email.split("@")[0],
          role,
        },
        token: idToken,
      };
    } catch (err: any) {
      return {
        success: false,
        error: "Unable to complete registration. Please verify your information.",
      };
    }
  }

  // Emulated registration for local development
  return {
    success: true,
    user: {
      id: `dev-${Date.now()}`,
      email,
      name: email.split("@")[0],
      role,
    },
  };
}

/**
 * Log out from Firebase and clear tokens
 */
export async function logoutFirebase(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signout error:", err);
    }
  }
  localStorage.removeItem("skill-token");
  localStorage.removeItem("skill-role");
}
