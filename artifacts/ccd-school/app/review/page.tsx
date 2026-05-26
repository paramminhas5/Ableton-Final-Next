import type { Metadata } from "next";
import { ReviewPageClient } from "@/components/ReviewPageClient";

export const metadata: Metadata = {
  title: "Review Session | CCD.SCHOOL",
  description: "Refresh the lessons that are starting to fade from memory.",
};

export default function ReviewPage() {
  return <ReviewPageClient />;
}
