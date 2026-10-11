import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth, DecodedIdToken } from "firebase-admin/auth";
import { prisma } from "./prisma";
import { logServerError } from "./errors";

let firebaseAdminApp: App | null = null;
let firebaseAuth: Auth | null = null;

/**
 * Initialize Firebase Admin SDK safely with environment variables or fallback.
 */
export function getFirebaseAdmin(): { app: App | null; auth: Auth | null; isConfigured: boolean } {
  if (firebaseAuth) {
    return { app: firebaseAdminApp, auth: firebaseAuth, isConfigured: true };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    try {
      if (getApps().length === 0) {
        firebaseAdminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        firebaseAdminApp = getApps()[0];
      }
      firebaseAuth = getAuth(firebaseAdminApp);
      console.log("[Firebase Admin] SDK initialized successfully for project:", projectId);
      return { app: firebaseAdminApp, auth: firebaseAuth, isConfigured: true };
    } catch (err) {
      logServerError("FirebaseAdminInit", err);
    }
  }

  // Not yet configured with live credentials
  return { app: null, auth: null, isConfigured: false };
}

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
  isEmulated?: boolean;
}

/**
 * Verify a Firebase ID token.
 * If live Firebase Admin is configured, verifies cryptographically via Firebase Auth.
 * If credentials are not yet set in .env, validates token structure safely for development.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser | null> {
  const { auth, isConfigured } = getFirebaseAdmin();

  if (isConfigured && auth) {
    try {
      const decoded: DecodedIdToken = await auth.verifyIdToken(idToken, true);
      if (!decoded.email) return null;
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0],
        picture: decoded.picture,
        isEmulated: false,
      };
    } catch (err) {
      logServerError("verifyFirebaseIdToken", err);
      return null;
    }
  }

  // Fallback / Development mode when Firebase Admin environment credentials are not yet populated
  try {
    // Attempt decoding standard base64 payload if token is a standard JWT structure (header.payload.sig)
    const parts = idToken.split(".");
    if (parts.length === 3) {
      const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
      const parsed = JSON.parse(payloadJson);
      if (parsed.email) {
        return {
          uid: parsed.sub || parsed.user_id || `fb-${Date.now()}`,
          email: parsed.email,
          name: parsed.name || parsed.email.split("@")[0],
          picture: parsed.picture,
          isEmulated: true,
        };
      }
    }
  } catch (err) {
    logServerError("fallbackTokenDecode", err);
  }

  return null;
}

/**
 * Sync authenticated Firebase user with SkillImprove database.
 */
export async function syncFirebaseUserWithDatabase(
  firebaseUser: VerifiedFirebaseUser,
  requestedRole: string = "STUDENT"
) {
  try {
    const roleMapping: Record<string, string> = {
      student: "STUDENT",
      industry: "RECRUITER",
      college: "COLLEGE_ADMIN",
      STUDENT: "STUDENT",
      RECRUITER: "RECRUITER",
      COLLEGE_ADMIN: "COLLEGE_ADMIN",
    };

    const targetRole = roleMapping[requestedRole] || "STUDENT";

    let dbUser = await prisma.user.findFirst({
      where: { email: firebaseUser.email },
      include: { profile: true },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: firebaseUser.name || "SkillImprove User",
          email: firebaseUser.email,
          image: firebaseUser.picture,
          role: targetRole,
          profile: {
            create: {
              headline: `${targetRole.replace("_", " ")} at SkillImprove`,
              readinessScore: 80,
              matchAverage: 90,
              internshipsDone: 1,
            },
          },
        },
        include: { profile: true },
      });
    }

    return dbUser;
  } catch (err) {
    logServerError("syncFirebaseUserWithDatabase", err);
    return null;
  }
}
