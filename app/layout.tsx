import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "RED IS COVER — Creative Direction",
  description: "A search for humanity in a cold, accelerating age.",
  openGraph: {
    title: "RED IS COVER — Creative Direction",
    description: "A search for humanity in a cold, accelerating age.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="p:domain_verify" content="18c8cbc5e6e7f14fbba5e48401a2f0f7" />
      </head>
      <body>{children}</body>
    </html>
  );
}
