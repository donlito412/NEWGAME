import type { Metadata } from "next";
import { Rajdhani, Russo_One } from "next/font/google";
import "./globals.css";

const display = Russo_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Rajdhani({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lil Artie: Roads of Amani",
  description: "A stylized open-world 3D adventure starring Lil Artie.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
