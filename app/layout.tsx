import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import { ProofyChatDockGate } from "@/components/proofy/ProofyChatDockGate";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
});

export const metadata: Metadata = {
  title: "ProofDive",
  description: "A guided interview-readiness platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${urbanist.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col tracking-tight bg-background font-sans text-foreground">
        <UserProvider>
          {children}
          <ProofyChatDockGate />
        </UserProvider>
      </body>
    </html>
  );
}
