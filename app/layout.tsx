import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { ContactContextProvider } from "@/contexts/ContactContext";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChitChat - Chat now!",
  description: "Chat Application by Zoodane",
  icons: "/logo_image.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`overflow-x-hidden darkscroll ${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthContextProvider>
            <ContactContextProvider>{children}</ContactContextProvider>
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
