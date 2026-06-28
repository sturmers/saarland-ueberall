import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saarländer weltweit",
  description: "Finde Saarländer auf der ganzen Welt – scanne eine Karte und trag dich ein.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
