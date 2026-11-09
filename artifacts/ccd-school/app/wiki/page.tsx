import { redirect } from "next/navigation";

/** The old lessons index is the syllabus now (9 Nov). The wiki itself is the library. */
export default function WikiPage() {
  redirect("/learn");
}
