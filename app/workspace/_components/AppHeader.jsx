"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useAuth,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function AppHeader({ hideSidebar = false }) {
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = email === "nia30207@gmail.com";

  if (!isLoaded) {
    return null; // wait until Clerk loads
  }

  return (
    <div className="p-2 sm:p-4 md:p-3 flex justify-between items-center shadow-sm border-b bg-white">
      {!hideSidebar && <SidebarTrigger className="h-8 w-8 sm:h-10 sm:w-10" />}

      <div className="ml-auto">
        <SignedOut>
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button size="sm">Sign Up</Button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="px-3 py-1.5 text-sm bg-emerald-950 text-white rounded-md hover:bg-emerald-700 transition"
              >
                Admin Dashboard
              </button>
            )}

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 sm:h-10 sm:w-10",
                },
              }}
            />
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

export default AppHeader;
