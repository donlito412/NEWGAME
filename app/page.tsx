import type { Metadata } from "next";
import { LilArtieGame } from "./game/LilArtieGame";

export const metadata: Metadata = {
  title: "Lil Artie: Roads of Amani",
  description: "A stylized open-world 3D adventure starring Lil Artie.",
};

export default function Home() {
  return <LilArtieGame />;
}
