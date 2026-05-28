"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin-dashboard")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) {
          toast.error(resData.error);
          return;
        }

        setData(resData);
      })
      .catch(() => {
        toast.error("Failed to load dashboard");
      });
  }, []);

  // LOADING
  if (!data?.stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        p-4
        sm:p-6

        space-y-8

        min-h-screen

        bg-linear-to-br
        from-emerald-50/30
        to-blue-50/30

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        transition-colors
        duration-500
      "
    >
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Overview
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitor your platform performance
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {data.stats.map((item, i) => (
          <div
            key={i}
            className="
              bg-white/80
              dark:bg-gray-900/70

              backdrop-blur-xl

              rounded-2xl

              p-5

              shadow-sm
              hover:shadow-xl

              transition-all
              duration-300

              border
              border-gray-100
              dark:border-gray-700

              hover:-translate-y-1
            "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.title}
            </p>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2 wrap-break-word">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* TODAY + RECENT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* TODAY SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* USERS */}
          <div
            className="
              rounded-2xl

              p-5

              bg-linear-to-br
              from-emerald-100
              to-emerald-50

              dark:from-emerald-500/20
              dark:to-emerald-500/5

              border
              border-emerald-200
              dark:border-emerald-500/20

              shadow-sm
              hover:shadow-lg

              transition-all
              duration-300

              hover:-translate-y-1
            "
          >
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              New Users
            </p>

            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">
              {data.today.users}
            </h2>

            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Today
            </p>
          </div>

          {/* COURSES */}
          <div
            className="
              rounded-2xl

              p-5

              bg-linear-to-br
              from-blue-100
              to-blue-50

              dark:from-blue-500/20
              dark:to-blue-500/5

              border
              border-blue-200
              dark:border-blue-500/20

              shadow-sm
              hover:shadow-lg

              transition-all
              duration-300

              hover:-translate-y-1
            "
          >
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              New Courses
            </p>

            <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">
              {data.today.courses}
            </h2>

            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Created today
            </p>
          </div>

          {/* QUIZ */}
          <div
            className="
              rounded-2xl

              p-5

              bg-linear-to-br
              from-purple-100
              to-purple-50

              dark:from-purple-500/20
              dark:to-purple-500/5

              border
              border-purple-200
              dark:border-purple-500/20

              shadow-sm
              hover:shadow-lg

              transition-all
              duration-300

              hover:-translate-y-1
            "
          >
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
              Quiz Attempts
            </p>

            <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mt-1">
              {data.today.quiz}
            </h2>

            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Today activity
            </p>
          </div>

        </div>

        {/* RECENT ACTIVITY */}
        <div
          className="
            bg-white/80
            dark:bg-gray-900/70

            backdrop-blur-xl

            rounded-2xl

            shadow-sm

            p-5

            border
            border-gray-100
            dark:border-gray-700
          "
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Recent Activity
          </h2>

          <div className="space-y-3 text-sm max-h-72 overflow-y-auto pr-1">

            {data.recentActivities.length === 0 ? (
              <p className="text-gray-400">
                No recent activity
              </p>
            ) : (
              data.recentActivities.map((item, i) => {

                const baseStyle =
                  `
                    p-3

                    rounded-xl

                    border

                    transition-all
                    duration-300

                    hover:shadow-sm
                  `;

                // COURSE
                if (item.type === "course") {
                  return (
                    <div
                      key={i}
                      className={`
                        ${baseStyle}

                        bg-emerald-50
                        dark:bg-emerald-500/10

                        border-emerald-100
                        dark:border-emerald-500/20
                      `}
                    >
                      <p className="text-gray-700 dark:text-gray-300 wrap-break-word">
                        <b className="text-emerald-700 dark:text-emerald-300">
                          {item.user}
                        </b>{" "}
                        created{" "}
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {item.name}
                        </span>
                      </p>
                    </div>
                  );
                }

                // QUIZ
                if (item.type === "quiz") {
                  return (
                    <div
                      key={i}
                      className={`
                        ${baseStyle}

                        bg-blue-50
                        dark:bg-blue-500/10

                        border-blue-100
                        dark:border-blue-500/20
                      `}
                    >
                      <p className="text-gray-700 dark:text-gray-300 wrap-break-word">
                        <b className="text-blue-700 dark:text-blue-300">
                          {item.user}
                        </b>{" "}
                        attempted a quiz
                      </p>
                    </div>
                  );
                }

                // ENROLL
                if (item.type === "enroll") {
                  return (
                    <div
                      key={i}
                      className={`
                        ${baseStyle}

                        bg-purple-50
                        dark:bg-purple-500/10

                        border-purple-100
                        dark:border-purple-500/20
                      `}
                    >
                      <p className="text-gray-700 dark:text-gray-300 wrap-break-word">
                        <b className="text-purple-700 dark:text-purple-300">
                          {item.user}
                        </b>{" "}
                        enrolled in{" "}
                        <span className="font-medium">
                          {item.cid}
                        </span>
                      </p>
                    </div>
                  );
                }

                // FEEDBACK
                if (item.type === "feedback") {
                  return (
                    <div
                      key={i}
                      className={`
                        ${baseStyle}

                        bg-yellow-50
                        dark:bg-yellow-500/10

                        border-yellow-100
                        dark:border-yellow-500/20
                      `}
                    >
                      <p className="text-gray-700 dark:text-gray-300 wrap-break-word">
                        <b className="text-yellow-700 dark:text-yellow-300">
                          {item.user}
                        </b>{" "}
                        gave feedback on{" "}
                        <span className="font-medium">
                          {item.cid}
                        </span>
                      </p>
                    </div>
                  );
                }

                return null;
              })
            )}

          </div>
        </div>

      </div>
    </div>
  );
}