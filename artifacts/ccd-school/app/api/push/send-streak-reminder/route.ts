/**
 * POST /api/push/send-streak-reminder
 *
 * Sends streak reminder push notifications to users who:
 *   - Have a streak > 0
 *   - Have NOT met their daily XP goal today
 *   - Have a push subscription registered
 *
 * Call this from a cron job at 20:00 UTC each day:
 *   curl -X POST https://ccd.school/api/push/send-streak-reminder \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * Implements Web Push (RFC 8030) + VAPID (RFC 8292) directly using
 * Node's built-in crypto and fetch — no web-push npm package needed.
 *
 * Env vars required:
 *   CRON_SECRET          — bearer token for cron authentication
 *   VAPID_PRIVATE_KEY    — VAPID private key (base64url, from web-push generate-vapid-keys)
 *   VAPID_PUBLIC_KEY     — VAPID public key  (base64url)
 *   VAPID_EMAIL          — contact email for VAPID (e.g. mailto:hello@ccd.school)
 */
import { NextRequest, NextResponse } from "next/server";
import { createSign, createHmac } from "crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DAILY_GOAL_XP = 50;

// ─── VAPID JWT builder (RFC 8292) ─────────────────────────────────────────────
// Builds a signed JWT for authenticating the push request to the push service.

function base64urlEncode(buf: Buffer | Uint8Array): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildVapidJwt(
  audience: string,   // e.g. "https://fcm.googleapis.com"
  subject: string,    // e.g. "mailto:hello@ccd.school"
  privateKeyBase64url: string,
): string {
  const header = base64urlEncode(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64urlEncode(
    Buffer.from(JSON.stringify({ aud: audience, exp: now + 43200, sub: subject })),
  );
  const signingInput = `${header}.${payload}`;

  // Convert base64url private key to PEM for Node crypto
  const keyBytes = Buffer.from(privateKeyBase64url, "base64url");
  // ES256 private key in raw form is 32 bytes; prepend SEC1 DER wrapper
  const pkcs8Header = Buffer.from(
    "308141020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420",
    "hex",
  );
  const pem = `-----BEGIN PRIVATE KEY-----\n${Buffer.concat([pkcs8Header, keyBytes]).toString("base64")}\n-----END PRIVATE KEY-----`;

  const sign = createSign("SHA256");
  sign.update(signingInput);
  // DER-encoded signature → extract R and S, encode as 64-byte raw
  const derSig = sign.sign(pem);
  // DER SEQUENCE: 0x30 <len> 0x02 <rLen> <r> 0x02 <sLen> <s>
  let offset = 2; // skip 0x30 and total length
  offset++; // 0x02
  const rLen = derSig[offset++];
  const r = derSig.slice(offset, offset + rLen);
  offset += rLen;
  offset++; // 0x02
  const sLen = derSig[offset++];
  const s = derSig.slice(offset, offset + sLen);
  // Pad R and S to 32 bytes each
  const rawSig = Buffer.concat([r.slice(-32).toString("hex").padStart(64, "0"), s.slice(-32).toString("hex").padStart(64, "0")].map(h => Buffer.from(h, "hex")));
  const signature = base64urlEncode(rawSig);

  return `${signingInput}.${signature}`;
}

// ─── Web Push HTTP request (RFC 8030) ─────────────────────────────────────────
// Sends an encrypted push notification to a subscription endpoint.
// Uses the "aesgcm" content encoding for broad browser support.

async function sendPushNotification(
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidEmail: string,
): Promise<{ ok: boolean; status: number }> {
  // Build the audience from the endpoint origin
  const url = new URL(sub.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const jwt = buildVapidJwt(audience, vapidEmail, vapidPrivateKey);
  const authHeader = `vapid t=${jwt},k=${vapidPublicKey}`;

  // Encrypt the payload using Web Push encryption (RFC 8291 / draft-ietf-webpush-encryption)
  // For simplicity we send an unencrypted empty push with a TTL and let the browser
  // show the notification from the service worker's push handler.
  // Full payload encryption requires ECDH key agreement which needs the SubtleCrypto
  // API — use the Web Crypto API available in the Next.js edge/Node runtime.
  const encrypted = await encryptPayload(payload, sub.keys.p256dh, sub.keys.auth);

  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "TTL": "86400",
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aesgcm",
      "Encryption": `salt=${encrypted.salt}`,
      "Crypto-Key": `dh=${encrypted.serverPublicKey};${authHeader}`,
      "Authorization": authHeader,
    },
    // Wrap Uint8Array in ArrayBuffer for the fetch BodyInit
    body: toArrayBuffer(encrypted.ciphertext),
  });

  return { ok: res.ok, status: res.status };
}

// ─── RFC 8291 payload encryption (aesgcm) ─────────────────────────────────────

async function encryptPayload(
  payload: string,
  clientPublicKeyBase64url: string,
  authBase64url: string,
): Promise<{ ciphertext: Uint8Array; salt: string; serverPublicKey: string }> {
  const wc = globalThis.crypto;

  // Generate ephemeral ECDH key pair
  const serverKeyPair = await wc.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );

  // Import client's public key — Web Crypto needs a plain ArrayBuffer
  const clientKeyBytes = new Uint8Array(Buffer.from(clientPublicKeyBase64url, "base64url"));
  const clientPublicKey = await wc.subtle.importKey(
    "raw",
    toArrayBuffer(clientKeyBytes),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  // ECDH key agreement
  const sharedSecretAB = await wc.subtle.deriveBits(
    { name: "ECDH", public: clientPublicKey },
    serverKeyPair.privateKey,
    256,
  );
  const sharedSecret = new Uint8Array(sharedSecretAB);

  const salt = wc.getRandomValues(new Uint8Array(16));
  const saltBase64url = base64urlEncode(salt);

  const authBytes = new Uint8Array(Buffer.from(authBase64url, "base64url"));
  const serverPublicKeyAB = await wc.subtle.exportKey("raw", serverKeyPair.publicKey);
  const serverPublicKeyBytes = new Uint8Array(serverPublicKeyAB);

  // HKDF for content encryption key + nonce (RFC 8291 §3.3)
  const ikm = await hkdf(
    Buffer.from(sharedSecret),
    Buffer.from(authBytes),
    Buffer.concat([
      Buffer.from("Content-Encoding: auth\0", "utf8"),
      Buffer.from(clientKeyBytes),
      Buffer.from(serverPublicKeyBytes),
    ]),
    32,
  );

  const contentKey = await hkdf(
    ikm,
    Buffer.from(salt),
    Buffer.from("Content-Encoding: aesgcm\0", "utf8"),
    16,
  );
  const nonce = await hkdf(
    ikm,
    Buffer.from(salt),
    Buffer.from("Content-Encoding: nonce\0", "utf8"),
    12,
  );

  // Web Crypto AES-GCM needs a plain ArrayBuffer
  const aesKey = await wc.subtle.importKey(
    "raw",
    toArrayBuffer(contentKey),
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const nonceAB = toArrayBuffer(nonce);

  // Pad payload to avoid content-length fingerprinting
  const payloadBytes = Buffer.from(payload, "utf8");
  const paddedPayload = Buffer.alloc(2 + payloadBytes.length);
  paddedPayload.writeUInt16BE(0, 0); // 0-byte padding
  payloadBytes.copy(paddedPayload, 2);

  const cipherAB = await wc.subtle.encrypt(
    { name: "AES-GCM", iv: nonceAB },
    aesKey,
    toArrayBuffer(paddedPayload),
  );

  return {
    ciphertext: new Uint8Array(cipherAB),
    salt: saltBase64url,
    serverPublicKey: base64urlEncode(serverPublicKeyBytes),
  };
}

// ─── HKDF helper (uses Node crypto HMAC) ─────────────────────────────────────

async function hkdf(ikm: Buffer, salt: Buffer, info: Buffer, length: number): Promise<Buffer> {
  // Extract
  const prk = createHmac("sha256", salt).update(ikm).digest();
  // Expand
  const n = Math.ceil(length / 32);
  let t = Buffer.alloc(0);
  let okm = Buffer.alloc(0);
  for (let i = 1; i <= n; i++) {
    t = createHmac("sha256", prk)
      .update(Buffer.concat([t, info, Buffer.from([i])]))
      .digest();
    okm = Buffer.concat([okm, t]);
  }
  return okm.slice(0, length);
}

/** Produce a guaranteed plain ArrayBuffer from any typed array or Buffer */
function toArrayBuffer(buf: Buffer | Uint8Array): ArrayBuffer {
  // slice() always returns a new Buffer/Uint8Array backed by a plain ArrayBuffer
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Authenticate cron caller
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:hello@ccd.school";

  if (!vapidPrivate || !vapidPublic) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Find users with streak > 0 AND daily goal not met AND push subscription exists
  const { rows } = await db.query(
    `SELECT ps.endpoint, ps.p256dh, ps.auth, up.streak_days
     FROM push_subscriptions ps
     JOIN user_progress up ON up.user_id = ps.user_id
     WHERE up.streak_days > 0
       AND (up.daily_xp_date != $1 OR up.daily_xp < $2)
     LIMIT 500`,
    [today, DAILY_GOAL_XP],
  );

  if (!rows.length) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    rows.map(async (row: { endpoint: string; p256dh: string; auth: string; streak_days: number }) => {
      try {
        const result = await sendPushNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify({
            title: "🔥 Don't break your streak!",
            body: `${row.streak_days}-day streak at risk. Do one lesson before midnight.`,
            url: "/learn",
          }),
          vapidPublic,
          vapidPrivate,
          vapidEmail,
        );

        if (result.ok) {
          sent++;
        } else {
          failed++;
          // 410 Gone = subscription expired/unsubscribed — clean it up
          if (result.status === 410) {
            await db.query("DELETE FROM push_subscriptions WHERE endpoint = $1", [row.endpoint]);
          }
        }
      } catch {
        failed++;
      }
    }),
  );

  return NextResponse.json({ sent, failed });
}
