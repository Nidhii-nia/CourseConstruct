import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "sonner"; 

import { EnrollProvider } from "@/context/EnrollContext";
import RouteLoader from "@/app/components/RouteLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CourseConstruct",
  description: "An AI based course generator",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-secondary`}
        >
          <Provider>
            <EnrollProvider>     {/* ✅ Wrap the entire app */}
              <RouteLoader />
              {children}
              <Toaster richColors position="top-right" />
            </EnrollProvider>
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
