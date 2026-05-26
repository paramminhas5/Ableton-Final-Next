import type { Metadata } from "next";
import { PublicProfileClient } from "@/components/PublicProfileClient";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} on CCD.SCHOOL`,
    description: `Check out ${username}'s progress on CCD.SCHOOL — the Duolingo for music.`,
    openGraph: {
      title: `${username} on CCD.SCHOOL`,
      description: `${username}'s music learning journey`,
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  return <PublicProfileClient username={username} />;
}
