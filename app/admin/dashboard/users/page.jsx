"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingUser, setLoadingUser] =
    useState(null);

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        "/api/admin-users"
      );

      const data = await res.json();

      setUsers(data.users || []);
    } catch (err) {
      toast.error(
        "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // HANDLE VIEW WITH LOADING
  const handleView = (id) => {
    setLoadingUser(id);

    setTimeout(() => {
      router.push(
        `/admin/dashboard/users/${id}`
      );
    }, 300);
  };

  return (
    <div
      className="
        p-4
        sm:p-6

        space-y-6

        min-h-screen

        bg-gradient-to-br
        from-emerald-50/40
        via-white
        to-blue-50/40

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        transition-colors
        duration-500
      "
    >
      {/* HEADER */}
      <div>
        <h1
          className="
            text-2xl
            font-bold

            text-gray-800
            dark:text-white
          "
        >
          Users
        </h1>

        <p
          className="
            text-sm

            text-gray-500
            dark:text-gray-400

            mt-1
          "
        >
          Manage and monitor
          platform users
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="min-h-[70vh] flex items-center justify-center">

          <div className="flex flex-col items-center gap-4">

            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading...
            </p>

          </div>

        </div>
      ) : users.length === 0 ? (
        /* EMPTY */
        <div
          className="
            text-center

            text-gray-400
            dark:text-gray-500

            py-14

            bg-white/60
            dark:bg-gray-900/60

            backdrop-blur-xl

            rounded-3xl

            border
            border-gray-100
            dark:border-gray-700
          "
        >
          No users found
        </div>
      ) : (
        <div
          className="
            bg-white/80
            dark:bg-gray-900/70

            backdrop-blur-xl

            rounded-3xl

            shadow-xl

            border
            border-gray-100
            dark:border-gray-700

            overflow-hidden
          "
        >
          {/* MOBILE CARDS */}
          <div className="block lg:hidden">

            {users.map((user) => (
              <div
                key={user.id}
                className={`
                  p-5

                  border-b
                  border-gray-100
                  dark:border-gray-800

                  space-y-4

                  transition-all

                  ${
                    loadingUser ===
                    user.id
                      ? `
                        opacity-60
                        pointer-events-none
                      `
                      : ""
                  }
                `}
              >
                {/* NAME */}
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    Name
                  </p>

                  <p className="font-medium text-gray-800 dark:text-white break-words">
                    {user.name}
                  </p>
                </div>

                {/* EMAIL */}
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    Email
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                    {user.email}
                  </p>
                </div>

                {/* FOOTER */}
                <div className="flex flex-wrap items-center justify-between gap-3">

                  {/* SUBSCRIPTION */}
                  <div>
                    {user.subscriptionId ? (
                      <span
                        className="
                          px-2
                          py-1

                          text-xs

                          rounded-full

                          bg-green-100
                          dark:bg-green-500/20

                          text-green-700
                          dark:text-green-300
                        "
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        className="
                          px-2
                          py-1

                          text-xs

                          rounded-full

                          bg-gray-100
                          dark:bg-gray-800

                          text-gray-500
                          dark:text-gray-300
                        "
                      >
                        Free
                      </span>
                    )}
                  </div>

                  {/* DATE */}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "--"}
                  </span>

                </div>

                {/* ACTION */}
                <button
                  onClick={() =>
                    handleView(user.id)
                  }
                  disabled={
                    loadingUser ===
                    user.id
                  }
                  className="
                    text-emerald-600
                    dark:text-emerald-300

                    hover:underline

                    text-sm
                    font-medium

                    transition-all
                  "
                >
                  {loadingUser ===
                  user.id
                    ? "Opening..."
                    : "View"}
                </button>
              </div>
            ))}

          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block overflow-x-auto">

            <table className="w-full text-sm">

              <thead
                className="
                  bg-gray-100/80
                  dark:bg-gray-800/70

                  text-gray-600
                  dark:text-gray-300
                "
              >
                <tr>

                  <th className="p-4 text-left font-semibold whitespace-nowrap">
                    Name
                  </th>

                  <th className="p-4 text-left font-semibold whitespace-nowrap">
                    Email
                  </th>

                  <th className="p-4 text-left font-semibold whitespace-nowrap">
                    Subscription
                  </th>

                  <th className="p-4 text-left font-semibold whitespace-nowrap">
                    Created
                  </th>

                  <th className="p-4 text-left font-semibold whitespace-nowrap">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`
                      border-t
                      border-gray-100
                      dark:border-gray-800

                      transition-all
                      duration-300

                      ${
                        loadingUser ===
                        user.id
                          ? `
                            opacity-60
                            pointer-events-none
                          `
                          : `
                            hover:bg-gray-50/80
                            dark:hover:bg-gray-800/50
                          `
                      }
                    `}
                  >
                    {/* NAME */}
                    <td className="p-4 font-medium text-gray-800 dark:text-white break-words">
                      {user.name}
                    </td>

                    {/* EMAIL */}
                    <td className="p-4 text-gray-600 dark:text-gray-300 break-all">
                      {user.email}
                    </td>

                    {/* SUBSCRIPTION */}
                    <td className="p-4">
                      {user.subscriptionId ? (
                        <span
                          className="
                            px-2
                            py-1

                            text-xs

                            rounded-full

                            bg-green-100
                            dark:bg-green-500/20

                            text-green-700
                            dark:text-green-300
                          "
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          className="
                            px-2
                            py-1

                            text-xs

                            rounded-full

                            bg-gray-100
                            dark:bg-gray-800

                            text-gray-500
                            dark:text-gray-300
                          "
                        >
                          Free
                        </span>
                      )}
                    </td>

                    {/* CREATED */}
                    <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "--"}
                    </td>

                    {/* ACTION */}
                    <td className="p-4">
                      <button
                        onClick={() =>
                          handleView(
                            user.id
                          )
                        }
                        disabled={
                          loadingUser ===
                          user.id
                        }
                        className="
                          text-emerald-600
                          dark:text-emerald-300

                          hover:underline

                          font-medium

                          transition-all
                        "
                      >
                        {loadingUser ===
                        user.id
                          ? "Opening..."
                          : "View"}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        </div>
      )}
    </div>
  );
}