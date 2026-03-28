import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { UserSync } from "@/components/UserSync";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VoiceAI — Voice to text, instantly",
  description:
    "Record your voice and get accurate transcripts with Whisper. VoiceAI Pro for unlimited use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#10a37f",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorText: "#0d0d0d",
          colorTextSecondary: "#6e6e80",
          colorDanger: "#ef4444",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-white border-[#e5e5e5] shadow-sm",
          headerTitle: "text-[#0d0d0d]",
          headerSubtitle: "text-[#6e6e80]",
          socialButtonsBlockButton:
            "bg-white border-[#e5e5e5] text-[#0d0d0d] hover:bg-[#f9f9f9]",
          formButtonPrimary: "bg-[#10a37f] hover:bg-[#0d8f6e]",
          footerActionLink: "text-[#10a37f]",
          formFieldInput: "bg-white border-[#e5e5e5] text-[#0d0d0d]",
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} min-h-screen font-sans`}>
          <UserSync />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
