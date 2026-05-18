import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dj")({
  beforeLoad: () => {
    throw redirect({ to: "/world/$slug", params: { slug: "dj" } });
  },
});
