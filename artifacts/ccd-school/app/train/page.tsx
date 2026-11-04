import { redirect } from "next/navigation";

/** The old ear training page. Practice has the Ear Gym on the engine now. */
export default function TrainPage() {
  redirect("/gym");
}
