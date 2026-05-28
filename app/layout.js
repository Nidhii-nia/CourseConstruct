import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "sonner";
import RouteLoader from "@/app/components/RouteLoader";
import ReactQueryProvider from "./react-query-provider";
import { ThemeProvider } from "./providers/theme-provider";
import "katex/dist/katex.min.css";

// Use stable font instead of Geist
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
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
          >
            <Provider>
              <ReactQueryProvider>
                <RouteLoader />
                {children}
                <Toaster richColors position="top-right" />
              </ReactQueryProvider>
            </Provider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
