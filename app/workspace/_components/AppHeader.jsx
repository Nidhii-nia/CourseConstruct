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

import { useEffect, useState } from "react";

import { useUser } from "@clerk/nextjs";

import { useRouter } from "next/navigation";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "next-themes";

function AppHeader({
  hideSidebar = false,
}) {
  const { isLoaded } =
    useAuth();

  const { user } =
    useUser();

  const router =
    useRouter();

  const [mounted, setMounted] =
    useState(false);

  const { theme, setTheme } =
    useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const email =
    user?.primaryEmailAddress
      ?.emailAddress;

  const isAdmin =
    email ===
    "nia30207@gmail.com";

  if (!isLoaded) {
    return null;
  }

  return (
    <div
      className="
        sticky
        top-0

        z-50

        w-full

        border-b
        border-emerald-100
        dark:border-gray-800

        bg-white/90
        dark:bg-gray-950/90

        backdrop-blur-xl

        shadow-sm
      "
    >
      <div
        className="
          px-3
          sm:px-4
          md:px-5

          py-2.5

          flex
          items-center
          justify-between

          gap-3
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-2">

          {!hideSidebar && (
            <SidebarTrigger
              className="
                h-9
                w-9

                rounded-xl

                hover:bg-emerald-100
                dark:hover:bg-gray-800

                transition-all
              "
            />
          )}

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* THEME TOGGLE */}
          {mounted && (
            <button
              onClick={() =>
                setTheme(
                  theme === "dark"
                    ? "light"
                    : "dark"
                )
              }
              className="
                h-9
                w-9

                rounded-xl

                border
                border-emerald-200
                dark:border-gray-700

                bg-white
                dark:bg-gray-900

                flex
                items-center
                justify-center

                hover:bg-emerald-50
                dark:hover:bg-gray-800

                transition-all
                duration-300

                shadow-sm
              "
            >
              {theme === "dark" ? (
                <Sun
                  className="
                    h-4
                    w-4

                    text-yellow-400
                  "
                />
              ) : (
                <Moon
                  className="
                    h-4
                    w-4

                    text-emerald-700
                  "
                />
              )}
            </button>
          )}

          <SignedOut>

            <div className="flex items-center gap-2">

              <SignInButton mode="modal">

                <Button
                  variant="outline"
                  size="sm"
                  className="
                    rounded-xl

                    border-emerald-200
                    dark:border-gray-700

                    dark:bg-gray-900
                    dark:text-white

                    hover:bg-emerald-50
                    dark:hover:bg-gray-800
                  "
                >
                  Sign In
                </Button>

              </SignInButton>

              <SignUpButton mode="modal">

                <Button
                  size="sm"
                  className="
                    rounded-xl

                    bg-emerald-600
                    hover:bg-emerald-700

                    text-white
                  "
                >
                  Sign Up
                </Button>

              </SignUpButton>

            </div>

          </SignedOut>

          <SignedIn>

            <div className="flex items-center gap-2">

              {/* ADMIN */}
              {mounted &&
                isAdmin && (
                  <button
                    onClick={() =>
                      router.push(
                        "/admin/dashboard"
                      )
                    }
                    className="
                      hidden
                      sm:flex

                      items-center

                      px-4
                      py-2

                      text-sm
                      font-medium

                      rounded-xl

                      bg-emerald-950
                      dark:bg-emerald-700

                      text-white

                      hover:bg-emerald-700
                      dark:hover:bg-emerald-600

                      transition-all

                      shadow-sm
                    "
                  >
                    Admin Dashboard
                  </button>
                )}

              {/* USER */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      `
                        h-9
                        w-9

                        sm:h-10
                        sm:w-10

                        ring-2
                        ring-emerald-200

                        dark:ring-emerald-500/20
                      `,
                  },
                }}
              />

            </div>

          </SignedIn>

        </div>
      </div>
    </div>
  );
}

export default AppHeader;