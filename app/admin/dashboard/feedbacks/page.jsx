"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin-feedbacks");
      const data = await res.json();

      const formatted = data.reports.map((r) => ({
        id: r.id,
        user: r.user,
        message: r.message || "No feedback",
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString(),
      }));

      setReports(formatted);
    } catch {
      console.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">User Feedbacks</h1>

      {/* LOADING */}
      {loading && (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!loading && reports.length === 0 && (
        <div className="text-center text-gray-400">No feedbacks found</div>
      )}

      {/* TABLE */}
      {!loading && reports.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">User</th>
                <th>Feedback</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t">
                  <td className="p-3">{report.user}</td>

                  <td className="p-3 max-w-75">{report.message}</td>

                  <td className="p-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < report.rating ? "⭐" : "☆"}</span>
                      ))}
                    </div>
                  </td>

                  <td className="p-3">{report.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
