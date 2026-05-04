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

  if (!data?.stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 bg-linear-to-br from-emerald-50/30 to-blue-50/30 min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500">
          Monitor your platform performance
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.stats.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition border border-gray-100"
          >
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* TODAY + RECENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TODAY */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

  {/* USERS */}
  <div className="rounded-xl p-4 bg-linear-to-br from-emerald-100 to-emerald-50 border border-emerald-200 shadow-sm hover:shadow-md transition">
    <p className="text-xs text-emerald-700 font-medium">New Users</p>
    <h2 className="text-2xl font-bold text-emerald-800 mt-1">
      {data.today.users}
    </h2>
    <p className="text-xs text-emerald-600 mt-1">Today</p>
  </div>

  {/* COURSES */}
  <div className="rounded-xl p-4 bg-linear-to-br from-blue-100 to-blue-50 border border-blue-200 shadow-sm hover:shadow-md transition">
    <p className="text-xs text-blue-700 font-medium">New Courses</p>
    <h2 className="text-2xl font-bold text-blue-800 mt-1">
      {data.today.courses}
    </h2>
    <p className="text-xs text-blue-600 mt-1">Created today</p>
  </div>

  {/* QUIZ */}
  <div className="rounded-xl p-4 bg-linear-to-br from-purple-100 to-purple-50 border border-purple-200 shadow-sm hover:shadow-md transition">
    <p className="text-xs text-purple-700 font-medium">Quiz Attempts</p>
    <h2 className="text-2xl font-bold text-purple-800 mt-1">
      {data.today.quiz}
    </h2>
    <p className="text-xs text-purple-600 mt-1">Today activity</p>
  </div>

</div>

        {/* RECENT */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Recent Activity
          </h2>

          <div className="space-y-3 text-sm max-h-72 overflow-y-auto pr-1">

            {data.recentActivities.length === 0 ? (
              <p className="text-gray-400">No recent activity</p>
            ) : (
              data.recentActivities.map((item, i) => {

                // 🎨 Activity card colors
                const baseStyle =
                  "p-3 rounded-xl border transition hover:shadow-sm";

                if (item.type === "course") {
                  return (
                    <div key={i} className={`${baseStyle} bg-emerald-50 border-emerald-100`}>
                      <p className="text-gray-700">
                        <b className="text-emerald-700">{item.user}</b> created{" "}
                        <span className="font-medium text-emerald-600">
                          {item.name}
                        </span>
                      </p>
                    </div>
                  );
                }

                if (item.type === "quiz") {
                  return (
                    <div key={i} className={`${baseStyle} bg-blue-50 border-blue-100`}>
                      <p className="text-gray-700">
                        <b className="text-blue-700">{item.user}</b> attempted a quiz
                      </p>
                    </div>
                  );
                }

                if (item.type === "enroll") {
                  return (
                    <div key={i} className={`${baseStyle} bg-purple-50 border-purple-100`}>
                      <p className="text-gray-700">
                        <b className="text-purple-700">{item.user}</b> enrolled in{" "}
                        <span className="font-medium">{item.cid}</span>
                      </p>
                    </div>
                  );
                }

                if (item.type === "feedback") {
                  return (
                    <div key={i} className={`${baseStyle} bg-yellow-50 border-yellow-100`}>
                      <p className="text-gray-700">
                        <b className="text-yellow-700">{item.user}</b> gave feedback on{" "}
                        <span className="font-medium">{item.cid}</span>
                      </p>
                    </div>
                  );
                }
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}