"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Search,
} from "lucide-react";

import { UserButton, SignedIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/dashboard/users", icon: Users },
  { name: "Courses", href: "/admin/dashboard/courses", icon: BookOpen },
  { name: "Analytics", href: "/admin/dashboard/analytics", icon: BarChart3 },
  { name: "Feedbacks", href: "/admin/dashboard/feedbacks", icon: FileText },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = email === "nia30207@gmail.com";

  // 🔍 Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔍 Search handler
  const handleSearch = async (value) => {
    if (!value) {
      setResults(null);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin-search?q=${value}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 👆 Click outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setResults(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div
      className="
        flex
        h-screen
        overflow-hidden

        bg-linear-to-br
        from-emerald-50
        to-blue-50

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        transition-colors
        duration-500
      "
    >

      {/* SIDEBAR */}
      <aside
        className="
          hidden
          md:flex

          w-64
          min-w-64

          flex-col

          bg-white/80
          dark:bg-gray-900/80

          backdrop-blur-xl

          border-r
          border-white
          dark:border-gray-800

          shadow-lg

          p-5
        "
      >
        {/* TITLE */}
        <h2 className="text-xl font-bold mb-8 text-emerald-700 dark:text-emerald-300">
          Admin Panel
        </h2>

        {/* NAVIGATION */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex
                  items-center
                  gap-3

                  p-3

                  rounded-xl

                  transition-all
                  duration-300

                  ${
                    isActive
                      ? `
                        bg-emerald-100
                        dark:bg-emerald-500/20

                        text-emerald-700
                        dark:text-emerald-300

                        font-medium
                      `
                      : `
                        text-gray-700
                        dark:text-gray-300

                        hover:bg-gray-100
                        dark:hover:bg-gray-800
                      `
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />

                <span className="truncate">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header
          className="
            h-16

            bg-white/80
            dark:bg-gray-900/80

            backdrop-blur-xl

            border-b
            border-white
            dark:border-gray-800

            shadow-sm

            flex
            items-center
            justify-between

            px-4
            sm:px-6

            relative
            z-30

            gap-4
          "
        >
          {/* LEFT */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* MOBILE MENU LABEL */}
            <h1
              className="
                text-base
                sm:text-lg

                font-semibold

                text-emerald-700
                dark:text-emerald-300

                whitespace-nowrap
              "
            >
              Admin Dashboard
            </h1>

            {/* SEARCH */}
            <div
              ref={searchRef}
              className="relative flex-1 max-w-md"
            >
              {/* INPUT WRAPPER */}
              <div
                className="
                  flex
                  items-center

                  bg-gray-100
                  dark:bg-gray-800

                  px-3
                  py-2

                  rounded-xl

                  border
                  border-transparent

                  focus-within:border-emerald-400

                  transition-all
                "
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 shrink-0" />
                )}

                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (query.trim().length < 2) {
                        setResults(null);
                        return;
                      }

                      handleSearch(query);
                    }
                  }}
                  placeholder="Search users, courses..."
                  className="
                    bg-transparent
                    outline-none

                    text-sm

                    text-gray-700
                    dark:text-gray-200

                    placeholder:text-gray-400
                    dark:placeholder:text-gray-500

                    w-full
                    min-w-0
                  "
                />
              </div>

              {/* HINT */}
              {!results &&
                query.length > 0 &&
                !loading && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                    Press Enter to search
                  </p>
                )}

              {/* DROPDOWN */}
              {(results || loading) && (
                <div
                  className="
                    absolute
                    mt-2

                    w-full

                    bg-white
                    dark:bg-gray-900

                    border
                    border-gray-200
                    dark:border-gray-700

                    shadow-2xl

                    rounded-2xl

                    p-3

                    z-50

                    max-h-96
                    overflow-y-auto
                  "
                >
                  {/* LOADING */}
                  {loading && (
                    <p className="text-xs text-gray-400 px-2 py-2">
                      Searching...
                    </p>
                  )}

                  {/* RESULTS */}
                  {!loading && results && (
                    <>
                      {/* USERS */}
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        Users
                      </p>

                      {results.users?.length ? (
                        results.users.map((u, i) => (
                          <div
                            key={`${u.id}-${i}`}
                            onClick={() =>
                              router.push(
                                `/admin/dashboard/users/${u.id}`
                              )
                            }
                            className="
                              p-3

                              rounded-xl

                              hover:bg-emerald-50
                              dark:hover:bg-gray-800

                              cursor-pointer

                              transition-all
                            "
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {u.name}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                              {u.email}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 px-2 py-2">
                          No users found
                        </p>
                      )}

                      {/* COURSES */}
                      <p className="text-xs font-semibold text-gray-400 mt-4 mb-2">
                        Courses
                      </p>

                      {results.courses?.length ? (
                        results.courses.map((c, i) => (
                          <div
                            key={`${c.id}-${i}`}
                            onClick={() => {
                              router.push(
                                `/admin/dashboard/courses/${c.id}`
                              );

                              setResults(null);
                            }}
                            className="
                              p-3

                              rounded-xl

                              hover:bg-emerald-50
                              dark:hover:bg-gray-800

                              cursor-pointer

                              transition-all
                            "
                          >
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {c.title}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID:{" "}
                              <span className="font-mono">
                                {c.id}
                              </span>
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {c.level} •{" "}
                              {c.category || "General"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 px-2 py-2">
                          No courses found
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

{/* RIGHT */}
<div className="flex items-center gap-3 shrink-0">

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

  {mounted && (
    <SignedIn>

      {/* WORKSPACE BUTTON */}
      {isAdmin && (
        <button
          onClick={() =>
            router.push("/workspace")
          }
          className="
            hidden
            sm:block

            px-3
            py-2

            text-sm

            bg-emerald-950
            dark:bg-emerald-600

            text-white

            rounded-xl

            hover:bg-emerald-700
            dark:hover:bg-emerald-500

            transition-all
          "
        >
          Workspace
        </button>
      )}

      {/* USER BUTTON */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: `
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
    </SignedIn>
  )}
</div>
        </header>

        {/* MOBILE SIDEBAR */}
        <div
          className="
            md:hidden

            overflow-x-auto

            bg-white/70
            dark:bg-gray-900/70

            backdrop-blur-xl

            border-b
            border-gray-200
            dark:border-gray-800
          "
        >
          <div className="flex gap-2 p-3 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex
                    items-center
                    gap-2

                    px-4
                    py-2

                    rounded-xl

                    text-sm

                    whitespace-nowrap

                    transition-all

                    ${
                      isActive
                        ? `
                          bg-emerald-100
                          dark:bg-emerald-500/20

                          text-emerald-700
                          dark:text-emerald-300
                        `
                        : `
                          text-gray-700
                          dark:text-gray-300

                          bg-white/70
                          dark:bg-gray-800
                        `
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />

                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <main
          className="
            flex-1
            overflow-y-auto

            p-4
            sm:p-6

            text-gray-900
            dark:text-white
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}