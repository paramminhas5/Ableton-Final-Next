import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { planForEvent, verifyWebhookSignature } from "../src/lib/razorpay";

const sign = (body: string, secret: string) =>
  createHmac("sha256", secret).update(body).digest("hex");

describe("razorpay webhook signature", () => {
  const body = JSON.stringify({ event: "subscription.activated" });
  it("accepts a correct signature", () => {
    expect(verifyWebhookSignature(body, sign(body, "s3cret"), "s3cret")).toBe(true);
  });
  it("rejects a wrong secret", () => {
    expect(verifyWebhookSignature(body, sign(body, "other"), "s3cret")).toBe(false);
  });
  it("rejects a tampered body", () => {
    const sig = sign(body, "s3cret");
    expect(verifyWebhookSignature(body + " ", sig, "s3cret")).toBe(false);
  });
  it("rejects a signature of the wrong length without throwing", () => {
    expect(verifyWebhookSignature(body, "abc", "s3cret")).toBe(false);
  });
});

describe("planForEvent", () => {
  it.each(["subscription.activated", "subscription.charged", "subscription.resumed"])(
    "%s -> pro",
    (e) => expect(planForEvent(e)).toBe("pro"),
  );
  it.each([
    "subscription.cancelled",
    "subscription.completed",
    "subscription.halted",
    "subscription.expired",
  ])("%s -> free", (e) => expect(planForEvent(e)).toBe("free"));
  it("ignores unrelated events", () => {
    expect(planForEvent("payment.captured")).toBeNull();
  });
});
