import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { clearFailures, clientIp, isThrottled, recordFailure } from "@/lib/throttle";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: "free" | "pro";
      role: "member" | "staff" | "owner";
    } & DefaultSession["user"];
  }
}

/** A valid bcrypt hash of a random string, used so a missing account costs the same time as a wrong password. */
const DUMMY_HASH = "$2b$12$RdfkMaG0l.Bp.AxMHf7Wx.Q3/AnjuIMnhu/0okkyw84Qvzow9PCRG";

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
      async authorize(credentials, request) {
        const raw = credentials as { email?: unknown; password?: unknown; name?: unknown; action?: unknown };
        // Emails are compared lowercased everywhere (scripts/migrate-security.sql adds a unique index on lower(email)).
        const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
        const password = typeof raw.password === "string" ? raw.password : "";
        const name = typeof raw.name === "string" ? raw.name.trim().slice(0, 80) : "";
        const action = raw.action === "signup" ? "signup" : "signin";
        if (!email || !password) return null;
        if (email.length > 200 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email");
        // bcrypt only reads the first 72 bytes; refuse longer so two different passwords cannot match.
        if (Buffer.byteLength(password, "utf8") > 72) throw new Error("Use a password of 72 characters or fewer");
        const ip = clientIp(request?.headers);
        if (await isThrottled(email, ip)) throw new Error("Too many tries. Wait 15 minutes and try again.");

        // Guard: fail clearly if no DB is configured
        const dbUrl =
          process.env.DATABASE_URL ??
          process.env.POSTGRES_URL ??
          process.env.POSTGRES_PRISMA_URL;
        if (!dbUrl) {
          throw new Error(
            "No database connection string found in env. " +
            "Add DATABASE_URL to your environment variables.",
          );
        }

        try {
          if (action === "signup") {
            if (password.length < 8) throw new Error("Use a password of 8 or more characters");
            const existing = await db.query(
              "SELECT id FROM users WHERE lower(email) = $1",
              [email],
            );
            if (existing.rows.length > 0)
              throw new Error("Email already in use");
            const hash = await bcrypt.hash(password, 12);
            const result = await db.query(
              "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, plan",
              [email, name || email.split("@")[0], hash],
            );
            const u = result.rows[0];
            return { id: u.id, email: u.email, name: u.name, plan: u.plan };
          } else {
            const result = await db.query(
              "SELECT id, email, name, password_hash, plan FROM users WHERE lower(email) = $1",
              [email],
            );
            const u = result.rows[0];
            // Compare against a dummy hash when there is no account, so timing does not reveal which emails exist.
            const valid = await bcrypt.compare(password, u?.password_hash ?? DUMMY_HASH);
            if (!u || !u.password_hash || !valid) {
              await recordFailure(email, ip);
              throw new Error("CredentialsSignin");
            }
            await clearFailures(email);
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
        user.email = user.email.trim().toLowerCase();
        try {
          // Account pre-hijack guard: password sign-ups do not verify the email, so someone could sign up
          // with another person's address first. When Google (which has verified the address) signs in to
          // an account for the first time, drop any password that was set before, so only the real owner
          // gets in. They can set a new password later.
          await db.query(
            `UPDATE users SET password_hash = NULL
              WHERE lower(email) = $1 AND password_hash IS NOT NULL
                AND NOT EXISTS (SELECT 1 FROM oauth_accounts o WHERE o.user_id = users.id AND o.provider = 'google')`,
            [user.email],
          );
          await db.query(
            `INSERT INTO users (email, name, image)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image`,
            [user.email, user.name ?? "", user.image ?? ""],
          );
          const r = await db.query("SELECT id FROM users WHERE lower(email) = $1", [
            user.email,
          ]);
          if (r.rows[0]) {
            await db.query(
              `INSERT INTO oauth_accounts (provider, provider_account_id, user_id)
               VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              ["google", account.providerAccountId, r.rows[0].id],
            );
          }
        } catch (err) {
          // Log but don't block sign-in — user can still auth even if DB write fails
          console.error("[auth] Google signIn DB error:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          try {
            const r = await db.query(
              "SELECT id, plan FROM users WHERE lower(email) = $1",
              [user.email.trim().toLowerCase()],
            );
            if (r.rows[0]) {
              token.userId = r.rows[0].id;
              token.plan = r.rows[0].plan;
              token.planCheckedAt = Date.now();
            }
          } catch (err) {
            console.error("[auth] Google jwt DB error:", err);
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
          try {
            const r = await db.query("SELECT plan, role FROM users WHERE id = $1", [
              token.userId,
            ]);
            if (r.rows[0]) {
              token.plan = r.rows[0].plan;
              token.role = r.rows[0].role;
              token.planCheckedAt = now;
            }
          } catch (err) {
            console.error("[auth] jwt plan refresh DB error:", err);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      (session.user as { plan?: string }).plan =
        (token.plan as string) ?? "free";
      (session.user as { role?: string }).role =
        (token.role as string) ?? "member";
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
