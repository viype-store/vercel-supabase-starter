import "./globals.css";

export const metadata = {
  title: "VYPE Store | VALORANT Points & Gifting",
  description: "A Vercel and Supabase storefront for VALORANT point packs and gifting requests.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
