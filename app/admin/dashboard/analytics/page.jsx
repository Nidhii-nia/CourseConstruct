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
  Legend,
  AreaChart,
  Area,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin-analytics");

        // Handle non-JSON response
        if (!res.ok) {
          const text = await res.text();
          console.error("API ERROR:", text);
          return;
        }

        const json = await res.json();

        setData({
          totalUsers: json.totalUsers || 0,
          usersTrend: json.usersTrend || 0,
          totalCourses: json.totalCourses || 0,
          publishedCourses: json.publishedCourses || 0,
          draftCourses: json.draftCourses || 0,
          totalEnrollments: json.totalEnrollments || 0,
          topCourses: json.topCourses || [],
          recentUsers: json.recentUsers || [],
        });
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 25000);

    return () => clearInterval(interval);
  }, []);

  // LOADING
  if (!data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  const pieData = [
    {
      name: "Published",
      value: data.publishedCourses,
    },
    {
      name: "Draft",
      value: data.draftCourses,
    },
  ];

  const COLORS = ["#22c55e", "#9ca3af"];

  return (
    <div
      className="
        p-4
        sm:p-6

        space-y-6

        min-h-screen

        bg-linear-to-br
        from-slate-50
        via-white
        to-emerald-50

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        transition-colors
        duration-500
      "
    >
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Analytics Dashboard
        </h1>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>

          Live data (auto refresh)
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPI
          title="Users"
          value={data.totalUsers}
          trend={data.usersTrend}
        />

        <KPI
          title="Courses"
          value={data.totalCourses}
        />

        <KPI
          title="Enrollments"
          value={data.totalEnrollments}
        />

        <KPI
          title="Published"
          value={data.publishedCourses}
        />
      </div>

      {/* MAIN CHART */}
      <Card title="Engagement Overview">

        {data.topCourses.length ? (
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.topCourses}>
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="enrollments"
                  radius={[8, 8, 0, 0]}
                >
                  {data.topCourses.map((_, index) => (
                    <Cell
                      key={index}
                      fill="#6366f1"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty text="No engagement yet" />
        )}

      </Card>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* TOP COURSES */}
        <Card title="Top Courses">

          {data.topCourses.length ? (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.topCourses}>

                  <defs>
                    <linearGradient
                      id="colorEnroll"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22c55e"
                        stopOpacity={0.8}
                      />

                      <stop
                        offset="95%"
                        stopColor="#22c55e"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#22c55e"
                    fill="url(#colorEnroll)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No course data yet" />
          )}

        </Card>

        {/* COURSE STATUS */}
        <Card title="Course Status">

          {pieData.some((d) => d.value > 0) ? (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No stats yet" />
          )}

        </Card>

      </div>

      {/* RECENT USERS */}
      <Card title="Recent Users">

        {data.recentUsers.length ? (
          <div className="space-y-2">

            {data.recentUsers.map((u) => (
              <div
                key={u.id}
                className="
                  flex
                  items-center
                  justify-between

                  gap-3

                  p-3

                  rounded-xl

                  hover:bg-gray-50
                  dark:hover:bg-gray-800/70

                  transition-all
                  duration-300
                "
              >
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">

                  <div
                    className="
                      w-9
                      h-9

                      shrink-0

                      bg-emerald-100
                      dark:bg-emerald-500/20

                      rounded-full

                      flex
                      items-center
                      justify-center

                      font-bold

                      text-emerald-700
                      dark:text-emerald-300
                    "
                  >
                    {u.name?.charAt(0)}
                  </div>

                  <span className="truncate text-gray-800 dark:text-gray-200">
                    {u.name}
                  </span>

                </div>

                {/* DATE */}
                <span className="text-gray-400 dark:text-gray-500 text-sm shrink-0">
                  {new Date(
                    u.createdAt
                  ).toLocaleDateString()}
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

  const styles = {
    Users:
      "from-blue-500 to-cyan-500",

    Courses:
      "from-purple-500 to-fuchsia-500",

    Enrollments:
      "from-orange-500 to-amber-500",

    Published:
      "from-emerald-500 to-green-500",
  };

  const bg =
    styles[title] ||
    "from-gray-500 to-gray-600";

  return (
    <div
      className={`
        bg-linear-to-br
        ${bg}

        text-white

        p-5

        rounded-2xl

        shadow-md
        hover:shadow-2xl

        transition-all
        duration-300

        hover:-translate-y-1
      `}
    >
      <p className="text-sm opacity-80">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1 wrap-break-word">
        {value}
      </p>

      {trend !== undefined && (
        <p
          className={`
            text-xs
            mt-1
            font-medium

            ${
              isPositive
                ? "text-green-100"
                : "text-red-200"
            }
          `}
        >
          {isPositive ? "↑" : "↓"}{" "}
          {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
}

/* CARD */
function Card({ title, children }) {
  return (
    <div
      className="
        bg-white/80
        dark:bg-gray-900/70

        backdrop-blur-xl

        p-5

        rounded-2xl

        shadow-md

        border
        border-gray-100
        dark:border-gray-700

        overflow-hidden
      "
    >
      <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">
        {title}
      </h2>

      {children}
    </div>
  );
}

/* EMPTY */
function Empty({ text }) {
  return (
    <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
      {text}
    </div>
  );
}