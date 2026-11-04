import type { Metadata } from "next";
import { ReviewPageClient } from "@/components/ReviewPageClient";

export const metadata: Metadata = {
  title: "review session",
  description: "Refresh the lessons that are starting to fade from memory.",
};

export default function ReviewPage() {
  return <ReviewPageClient />;
}
