import { redirect } from "next/navigation";

/** The old flat list of missions. Every lesson now lives in a world and its paths. */
export default function MissionsPage() {
  redirect("/worlds");
}
