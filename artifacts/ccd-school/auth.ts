import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: "free" | "pro";
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
        name: {},
        action: {},
      },
      async authorize(credentials) {
        const { email, password, name, action } = credentials as {
          email: string;
          password: string;
          name: string;
          action: string;
        };
        if (!email || !password) return null;

        try {
          if (action === "signup") {
            const existing = await db.query(
              "SELECT id FROM users WHERE email = $1",
              [email],
            );
            if (existing.rows.length > 0)
              throw new Error("Email already in use");
            const hash = await bcrypt.hash(password, 10);
            const result = await db.query(
              "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, plan",
              [email, name || email.split("@")[0], hash],
            );
            const u = result.rows[0];
            return { id: u.id, email: u.email, name: u.name, plan: u.plan };
          } else {
            const result = await db.query(
              "SELECT id, email, name, password_hash, plan FROM users WHERE email = $1",
              [email],
            );
            if (!result.rows.length) return null;
            const u = result.rows[0];
            if (!u.password_hash) return null;
            const valid = await bcrypt.compare(password, u.password_hash);
            if (!valid) return null;
            return { id: u.id, email: u.email, name: u.name, plan: u.plan };
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Sign-in failed";
          throw new Error(msg);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await db.query(
          `INSERT INTO users (email, name, image)
           VALUES ($1, $2, $3)
           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image`,
          [user.email, user.name ?? "", user.image ?? ""],
        );
        const r = await db.query("SELECT id FROM users WHERE email = $1", [
          user.email,
        ]);
        if (r.rows[0]) {
          await db.query(
            `INSERT INTO oauth_accounts (provider, provider_account_id, user_id)
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            ["google", account.providerAccountId, r.rows[0].id],
          );
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          const r = await db.query(
            "SELECT id, plan FROM users WHERE email = $1",
            [user.email],
          );
          if (r.rows[0]) {
            token.userId = r.rows[0].id;
            token.plan = r.rows[0].plan;
            token.planCheckedAt = Date.now();
          }
        } else {
          token.userId = user.id;
          token.plan = (user as { plan?: string }).plan ?? "free";
          token.planCheckedAt = Date.now();
        }
      } else if (token.userId) {
        const now = Date.now();
        const last = (token.planCheckedAt as number) ?? 0;
        if (now - last > 5 * 60 * 1000) {
          const r = await db.query("SELECT plan FROM users WHERE id = $1", [
            token.userId,
          ]);
          if (r.rows[0]) {
            token.plan = r.rows[0].plan;
            token.planCheckedAt = now;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      (session.user as { plan?: string }).plan =
        (token.plan as string) ?? "free";
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
