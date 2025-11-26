// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs";
// import Provider from "./provider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "CourseConstruct",
//   description: "An AI based course generator",
// };

// export default function RootLayout({ children }) {
//   return (
//     <ClerkProvider>
//           <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//        <Provider> {children} </Provider>
//       </body>
//     </html>
//     </ClerkProvider>
//   );
// }

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "sonner"; // ✅ import Toaster

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
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Provider>
            {children}
            {/* ✅ Add the Sonner Toaster here */}
            <Toaster richColors position="top-right" />
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}

