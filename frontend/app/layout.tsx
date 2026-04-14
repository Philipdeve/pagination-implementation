import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Backend Test Frontend",
  description: "Minimal Next.js client for backend testing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
