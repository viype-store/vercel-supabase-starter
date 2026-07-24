import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata = {
  title: "YourBrand Starter",
  description: "A ready-to-deploy Vercel and Supabase starter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
