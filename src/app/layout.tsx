import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Kalam } from "next/font/google";
import { LangProvider } from "@/components/LangContext";
import "./globals.css";

const body = Atkinson_Hyperlegible({ variable: "--font-body", weight: ["400", "700"], subsets: ["latin"] });
const pen = Kalam({ variable: "--font-pen", weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KerjaCheck: is this part-time job offer a scam?",
  description:
    "Paste a part-time job offer from WhatsApp or Telegram. KerjaCheck marks job-scam and money-mule red flags in English and Bahasa Melayu. Runs in your browser; nothing is sent.",
};

export const viewport: Viewport = { themeColor: "#1f2f7a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${pen.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
