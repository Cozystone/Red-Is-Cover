import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANSEO — Creative Direction",
  description: "A search for humanity in a cold, accelerating age.",
  openGraph: {
    title: "ANSEO — Creative Direction",
    description: "A search for humanity in a cold, accelerating age.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
