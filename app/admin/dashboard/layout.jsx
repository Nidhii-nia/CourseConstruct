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

  // ✅ Hydration fix
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔍 Search handler (Enter based)
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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-br from-emerald-50 to-blue-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-5 flex flex-col min-h-screen">
        <h2 className="text-xl font-bold mb-8 text-emerald-700">Admin Panel</h2>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6 relative z-30">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-emerald-700">
              Admin Dashboard
            </h1>

            {/* SEARCH */}
            <div ref={searchRef} className="relative">
              {/* INPUT */}
              <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                )}

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                  className="bg-transparent outline-none text-sm w-48"
                />
              </div>

              {/* HINT */}
              {!results && query.length > 0 && !loading && (
                <p className="text-xs text-gray-400 mt-1 px-1">
                  Press Enter to search
                </p>
              )}

              {/* DROPDOWN */}
              {(results || loading) && (
                <div className="absolute mt-2 w-80 bg-white shadow-xl rounded-xl p-3 z-50 max-h-96 overflow-y-auto">
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
                              router.push(`/admin/dashboard/users/${u.id}`)
                            }
                            className="p-2 rounded-lg hover:bg-emerald-50 cursor-pointer"
                          >
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
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
                              router.push(`/admin/dashboard/courses/${c.id}`);
                              setResults(null);
                            }}
                            className="p-2 rounded-lg hover:bg-emerald-50 cursor-pointer"
                          >
                            <p className="text-sm font-semibold">{c.title}</p>
                            <p className="text-xs text-gray-400">
                              ID: <span className="font-mono">{c.id}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {c.level} • {c.category || "General"}
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
          <div className="flex items-center gap-4">
            {/* 👤 USER (FIXED) */}
            {mounted && (
              <SignedIn>
                {isAdmin && (
                  <button
                    onClick={() => router.push("/workspace")}
                    className="px-3 py-1.5 text-sm bg-emerald-950 text-white rounded-md hover:bg-emerald-700 transition"
                  >
                    Workspace
                  </button>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                />
              </SignedIn>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
