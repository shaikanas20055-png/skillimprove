import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { rateLimiter, RATE_LIMIT_CONFIGS } from "./rate-limiter";
import { GENERIC_ERRORS, logServerError } from "./errors";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "alex@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(GENERIC_ERRORS.INVALID_CREDENTIALS);
        }

        const rateKey = `nextauth:${credentials.email.toLowerCase()}`;
        const rateStatus = rateLimiter.check(rateKey, RATE_LIMIT_CONFIGS.LOGIN);
        if (!rateStatus.allowed) {
          throw new Error(GENERIC_ERRORS.RATE_LIMIT_EXCEEDED);
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { profile: true },
          });

          let isValid = false;
          if (user && user.password) {
            isValid = await bcrypt.compare(credentials.password, user.password);
          } else {
            // Timing-attack prevention
            await bcrypt.compare(credentials.password, "$2a$10$wN1q8vF4fUvT8V8n5fUVOeX8n0O9aG9D4F2sQ3j4K5l6M7n8P9q0R");
          }

          if (!isValid) {
            rateLimiter.consume(rateKey, RATE_LIMIT_CONFIGS.LOGIN);
            // GENERIC ERROR: Do not differentiate between user not found and bad password
            throw new Error(GENERIC_ERRORS.INVALID_CREDENTIALS);
          }

          rateLimiter.reset(rateKey);

          return {
            id: user!.id,
            name: user!.name,
            email: user!.email,
            role: user!.role,
          };
        } catch (err: any) {
          logServerError("NextAuthAuthorize", err);
          throw new Error(GENERIC_ERRORS.INVALID_CREDENTIALS);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-skillimprove-dev-secret",
};
