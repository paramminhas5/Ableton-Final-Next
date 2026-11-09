import type { Metadata } from "next";
import { StartClient } from "./StartClient";

export const metadata: Metadata = {
  title: "see how it works",
  description: "A two-minute walk through ccd school, recorded from the real app: learn, practice, studio, dj decks and library.",
};

export default function StartPage() {
  return <StartClient />;
}
