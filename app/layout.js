import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "sonner";
import RouteLoader from "@/app/components/RouteLoader";
import ReactQueryProvider from "./react-query-provider";

// ✅ Use stable font instead of Geist
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "CourseConstruct",
  description: "An AI based course generator",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased bg-secondary`}>
          <Provider>
            <ReactQueryProvider>
              <RouteLoader />
              {children}
              <Toaster richColors position="top-right" />
            </ReactQueryProvider>
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}