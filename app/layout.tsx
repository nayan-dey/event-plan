import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event Planner",
  description: "Register and participate in amazing events",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#ffffff",
          colorText: "#1f2937",
          colorInputBackground: "#f9fafb",
          colorInputText: "#1f2937",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary:
            "bg-indigo-600 hover:bg-indigo-700 text-white font-medium",
          card: "shadow-lg",
          headerTitle: "text-gray-900 font-bold",
          headerSubtitle: "text-gray-600",
          socialButtonsBlockButton:
            "border border-gray-200 hover:bg-gray-50 transition-colors",
          formFieldInput:
            "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
          footerActionLink: "text-indigo-600 hover:text-indigo-500",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
