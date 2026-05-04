"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/admin-analytics")
        .then((res) => res.json())
        .then(setData);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // 🔥 real-time

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-linear-to-br from-slate-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Published", value: data.publishedCourses || 0 },
    { name: "Draft", value: data.draftCourses || 0 },
  ];

  const COLORS = ["#22c55e", "#9ca3af"];

  return (
    <div className="p-6 space-y-6 bg-linear-to-br from-slate-50 via-white to-emerald-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Analytics Dashboard
          </h1>

          {/* LIVE INDICATOR */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            Live data (5s refresh)
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <KPI title="Users" value={data.totalUsers} trend={data.usersTrend} />
        <KPI title="Courses" value={data.totalCourses} />
        <KPI title="Enrollments" value={data.totalEnrollments} />
        <KPI title="Published" value={data.publishedCourses} />
      </div>

      {/* MAIN CHART */}
      <Card title="Engagement Overview">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data.topCourses}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="enrollments"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Top Courses">
          {data.topCourses?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topCourses}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrollments" animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="No course data yet" />
          )}
        </Card>

        <Card title="Course Status">
          {pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="No stats yet" />
          )}
        </Card>
      </div>

      {/* RECENT USERS */}
      <Card title="Recent Users">
        {data.recentUsers?.length ? (
          <div className="space-y-2">
            {data.recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                    {u.name?.charAt(0)}
                  </div>
                  <span>{u.name}</span>
                </div>

                <span className="text-gray-400 text-sm">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No users yet" />
        )}
      </Card>
    </div>
  );
}

/* KPI */
function KPI({ title, value, trend }) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border hover:shadow-lg transition">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="text-2xl font-bold mt-1">{value}</p>

      {trend !== undefined && (
        <p
          className={`text-xs mt-1 font-medium ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
}

/* CARD */
function Card({ title, children }) {
  return (
    <div className="bg-white/80 backdrop-blur border rounded-2xl shadow-md p-5">
      <h2 className="font-semibold mb-3 text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

/* EMPTY */
function Empty({ text }) {
  return (
    <div className="h-50 flex flex-col items-center justify-center gap-2 text-gray-400">
      <div className="w-24 h-2 bg-gray-200 animate-pulse rounded"></div>
      <div className="w-16 h-2 bg-gray-200 animate-pulse rounded"></div>
      <p className="text-xs mt-2">{text}</p>
    </div>
  );
}