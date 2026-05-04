"use client";

import { SignIn } from "@clerk/nextjs";

export default function AdminLogin() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn
        appearance={{
          elements: {
            card: "shadow-xl rounded-xl",
            headerTitle: "text-2xl font-bold",
          },
        }}
        path="/admin-login"
        routing="path"
        signUpUrl="/sign-up"
        forceRedirectUrl="/admin-check"
      />
    </div>
  );
}
