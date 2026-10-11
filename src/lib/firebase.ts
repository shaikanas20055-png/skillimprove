import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
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
    console.log("[Firebase] Web Client initialized successfully!");
  } catch (err) {
    console.warn("Firebase client initialization warning:", err);
  }
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

// Client-Side Rate Limiter (Max 5 attempts / 15 minutes)
const RATE_LIMIT_PREFIX = "skillimprove_ratelimit_";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkClientRateLimit(key: string): { allowed: boolean; remaining: number; resetSeconds: number } {
  try {
    const raw = sessionStorage.getItem(`${RATE_LIMIT_PREFIX}${key}`);
    if (!raw) return { allowed: true, remaining: MAX_ATTEMPTS, resetSeconds: 0 };
    const entry = JSON.parse(raw);
    const now = Date.now();

    if (entry.blockedUntil && entry.blockedUntil > now) {
      return { allowed: false, remaining: 0, resetSeconds: Math.ceil((entry.blockedUntil - now) / 1000) };
    }

    if (now - entry.firstAttempt > WINDOW_MS) {
      sessionStorage.removeItem(`${RATE_LIMIT_PREFIX}${key}`);
      return { allowed: true, remaining: MAX_ATTEMPTS, resetSeconds: 0 };
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - entry.count);
    return {
      allowed: entry.count < MAX_ATTEMPTS,
      remaining,
      resetSeconds: Math.ceil((entry.firstAttempt + WINDOW_MS - now) / 1000),
    };
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS, resetSeconds: 0 };
  }
}

function consumeClientRateLimit(key: string): { allowed: boolean; remaining: number; resetSeconds: number } {
  try {
    const storageKey = `${RATE_LIMIT_PREFIX}${key}`;
    const raw = sessionStorage.getItem(storageKey);
    const now = Date.now();
    let entry = raw ? JSON.parse(raw) : null;

    if (!entry || now - entry.firstAttempt > WINDOW_MS) {
      entry = { count: 1, firstAttempt: now };
    } else {
      entry.count += 1;
    }

    if (entry.count >= MAX_ATTEMPTS) {
      entry.blockedUntil = now + WINDOW_MS;
      sessionStorage.setItem(storageKey, JSON.stringify(entry));
      return { allowed: false, remaining: 0, resetSeconds: Math.ceil(WINDOW_MS / 1000) };
    }

    sessionStorage.setItem(storageKey, JSON.stringify(entry));
    return {
      allowed: true,
      remaining: Math.max(0, MAX_ATTEMPTS - entry.count),
      resetSeconds: Math.ceil((entry.firstAttempt + WINDOW_MS - now) / 1000),
    };
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetSeconds: 0 };
  }
}

function resetClientRateLimit(key: string) {
  try {
    sessionStorage.removeItem(`${RATE_LIMIT_PREFIX}${key}`);
  } catch {
    // ignore
  }
}

// Built-in Demo Credentials Directory
export const DEMO_ACCOUNTS: Record<string, { email: string; pass: string; role: string; name: string }> = {
  student: {
    email: "student@skillimprove.com",
    pass: "Student@123",
    role: "student",
    name: "Alex Johnson",
  },
  industry: {
    email: "industry@skillimprove.com",
    pass: "Industry@123",
    role: "industry",
    name: "TechNova Solutions",
  },
  college: {
    email: "college@skillimprove.com",
    pass: "College@123",
    role: "college",
    name: "ABC Institute of Technology",
  },
};

/**
 * Perform login using Firebase Auth if configured, verified against the secure backend,
 * with seamless demo credentials support and full rate limiting.
 */
export async function authenticateWithFirebaseOrBackend(
  email: string,
  pass: string,
  role: string
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const rateLimitKey = `auth_${normalizedEmail}`;

  // 1. Check Rate Limit
  const rateStatus = checkClientRateLimit(rateLimitKey);
  if (!rateStatus.allowed) {
    return {
      success: false,
      error: "Too many failed login attempts. For security reasons, authentication is temporarily locked.",
      retryAfterSeconds: rateStatus.resetSeconds,
      remainingAttempts: 0,
    };
  }

  // 2. Check Demo Credentials Match
  const matchedDemo = Object.values(DEMO_ACCOUNTS).find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  if (matchedDemo) {
    if (matchedDemo.pass === pass) {
      resetClientRateLimit(rateLimitKey);
      const token = `demo-token-${Date.now()}`;
      localStorage.setItem("skill-token", token);
      localStorage.setItem("skill-role", matchedDemo.role);

      // Attempt background backend sync if backend is running
      try {
        const backendBase =
          (import.meta as any).env?.VITE_API_URL ||
          ((import.meta as any).env?.PROD ? "/api" : "http://localhost:3001/api");
        fetch(`${backendBase}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: matchedDemo.email, password: pass, role: matchedDemo.role }),
        }).catch(() => {});
      } catch {}

      return {
        success: true,
        user: {
          id: `demo-${matchedDemo.role}`,
          name: matchedDemo.name,
          email: matchedDemo.email,
          role: matchedDemo.role,
        },
        token,
      };
    } else {
      // Wrong password for demo account
      const consumed = consumeClientRateLimit(rateLimitKey);
      return {
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
        remainingAttempts: consumed.remaining,
        retryAfterSeconds: !consumed.allowed ? consumed.resetSeconds : undefined,
      };
    }
  }

  // 3. If live Firebase Client is active
  if (isFirebaseConfigured && auth) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await userCred.user.getIdToken();
      resetClientRateLimit(rateLimitKey);
      localStorage.setItem("skill-token", idToken);
      localStorage.setItem("skill-role", role);

      return {
        success: true,
        user: {
          id: userCred.user.uid,
          email: userCred.user.email || email,
          name: userCred.user.displayName || email.split("@")[0],
          role,
        },
        token: idToken,
      };
    } catch (firebaseErr: any) {
      console.warn("Firebase sign-in attempted:", firebaseErr?.code);
      const consumed = consumeClientRateLimit(rateLimitKey);
      return {
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
        remainingAttempts: consumed.remaining,
        retryAfterSeconds: !consumed.allowed ? consumed.resetSeconds : undefined,
      };
    }
  }

  // 4. Try Backend Login
  const backendBase =
    (import.meta as any).env?.VITE_API_URL ||
    ((import.meta as any).env?.PROD ? "/api" : "http://localhost:3001/api");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${backendBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password: pass, role }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (res.ok && data.success) {
      resetClientRateLimit(rateLimitKey);
      if (data.token) localStorage.setItem("skill-token", data.token);
      localStorage.setItem("skill-role", data.user?.role || role);
      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    }

    if (res.status === 429) {
      return {
        success: false,
        error: data.error || "Too many failed login attempts. Please try again later.",
        retryAfterSeconds: data.retryAfterSeconds || 900,
      };
    }

    const consumed = consumeClientRateLimit(rateLimitKey);
    return {
      success: false,
      error: "Invalid email or password. Please verify your credentials.",
      remainingAttempts: data.remainingAttempts ?? consumed.remaining,
      retryAfterSeconds: !consumed.allowed ? consumed.resetSeconds : undefined,
    };
  } catch {
    // Backend offline and credentials not recognized
    const consumed = consumeClientRateLimit(rateLimitKey);
    return {
      success: false,
      error: "Invalid email or password. Please verify your credentials.",
      remainingAttempts: consumed.remaining,
      retryAfterSeconds: !consumed.allowed ? consumed.resetSeconds : undefined,
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
    } catch {
      return {
        success: false,
        error: "Unable to complete registration. Please verify your information.",
      };
    }
  }

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
