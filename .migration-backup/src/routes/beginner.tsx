import { createFileRoute, redirect } from "@tanstack/react-router";

// Permanent redirect — runs in beforeLoad so there's no flash of empty page
export const Route = createFileRoute("/beginner")({
  beforeLoad: () => {
    throw redirect({ to: "/world/$slug", params: { slug: "fundamentals" } });
  },
});
