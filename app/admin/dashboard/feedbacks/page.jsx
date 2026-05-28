"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(
        "/api/admin-feedbacks"
      );

      const data = await res.json();

      const formatted =
        data.reports.map((r) => ({
          id: r.id,
          user: r.user,
          message:
            r.message || "No feedback",
          rating: r.rating,
          date: new Date(
            r.createdAt
          ).toLocaleDateString(),
        }));

      setReports(formatted);
    } catch {
      console.error(
        "Failed to fetch reports"
      );
    } finally {
      setLoading(false);
    }
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
          User Feedbacks
        </h1>

        <p
          className="
            text-sm

            text-gray-500
            dark:text-gray-400

            mt-1
          "
        >
          Monitor and review
          platform user feedback
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="min-h-[70vh] flex items-center justify-center">

          <div className="flex flex-col items-center gap-4">

            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading...
            </p>

          </div>

        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        reports.length === 0 && (
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
            No feedbacks found
          </div>
        )}

      {/* TABLE */}
      {!loading &&
        reports.length > 0 && (
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

              {reports.map((report) => (
                <div
                  key={report.id}
                  className="
                    p-5

                    border-b
                    border-gray-100
                    dark:border-gray-800

                    space-y-4
                  "
                >
                  {/* USER */}
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                      User
                    </p>

                    <p className="font-medium text-gray-800 dark:text-white break-words">
                      {report.user}
                    </p>
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                      Feedback
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                      {report.message}
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between gap-4">

                    {/* RATING */}
                    <div className="flex gap-1 text-lg">
                      {Array.from({
                        length: 5,
                      }).map((_, i) => (
                        <span key={i}>
                          {i <
                          report.rating
                            ? "⭐"
                            : "☆"}
                        </span>
                      ))}
                    </div>

                    {/* DATE */}
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      {report.date}
                    </span>

                  </div>
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
                      User
                    </th>

                    <th className="p-4 text-left font-semibold whitespace-nowrap">
                      Feedback
                    </th>

                    <th className="p-4 text-left font-semibold whitespace-nowrap">
                      Rating
                    </th>

                    <th className="p-4 text-left font-semibold whitespace-nowrap">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="
                        border-t
                        border-gray-100
                        dark:border-gray-800

                        hover:bg-gray-50/80
                        dark:hover:bg-gray-800/50

                        transition-all
                        duration-300
                      "
                    >
                      {/* USER */}
                      <td className="p-4">
                        <div className="font-medium text-gray-800 dark:text-white break-words">
                          {report.user}
                        </div>
                      </td>

                      {/* MESSAGE */}
                      <td className="p-4 max-w-[400px]">
                        <p className="text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                          {report.message}
                        </p>
                      </td>

                      {/* RATING */}
                      <td className="p-4">
                        <div className="flex gap-1 text-base">
                          {Array.from({
                            length: 5,
                          }).map((_, i) => (
                            <span key={i}>
                              {i <
                              report.rating
                                ? "⭐"
                                : "☆"}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {report.date}
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