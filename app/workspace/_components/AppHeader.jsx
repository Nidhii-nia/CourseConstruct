"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

function AppHeader({ hideSidebar = false }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-2 sm:p-4 md:p-3 flex justify-between items-center shadow-sm border-b bg-white">
      {!hideSidebar && (
        <SidebarTrigger className="h-8 w-8 sm:h-10 sm:w-10" />
      )}

      <div className="ml-auto">
        {/* ⛔ Prevent SSR mismatch */}
        {mounted && (
          <>
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
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 sm:h-10 sm:w-10",
                  },
                }}
              />
            </SignedIn>
          </>
        )}
      </div>
    </div>
  );
}

export default AppHeader;