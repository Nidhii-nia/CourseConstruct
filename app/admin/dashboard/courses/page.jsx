"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const router = useRouter();

  const handleView = (cid) => {
    setLoadingCourse(cid);

    setTimeout(() => {
      router.push(`/admin/dashboard/courses/${cid}`);
    }, 300);
  };

  // 📡 Fetch courses
  const fetchCourses = async (deleted = false) => {
    setLoading(true);
    try {
      const url = `/api/admin-courses${deleted ? "?showDeleted=true" : ""}`;
      console.log("📡 Fetching from:", url)
      const res = await fetch(url);
      const data = await res.json();
      console.log("Courses:", data.courses);
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle
  const handleToggleDeleted = () => {
    const newShowDeleted = !showDeleted;
    setShowDeleted(newShowDeleted);
    fetchCourses(newShowDeleted);
  };

  useEffect(() => {
    fetchCourses(false);
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
        <button
          onClick={handleToggleDeleted}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            showDeleted
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {showDeleted ? "Back" : "Show Deleted"}
        </button>
      </div>

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
      {!loading && courses.length === 0 && (
        <div className="text-center text-gray-400 py-10">No courses found</div>
      )}

      {/* GRID */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.cid}
              className="bg-white rounded-2xl shadow-sm border p-4 transition hover:shadow-md"
            >
              <div
                onClick={() => handleView(course.cid)}
                className={`cursor-pointer ${
                  loadingCourse === course.cid
                    ? "opacity-60 pointer-events-none"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {course.name}
                  </h2>

                  {/*  USER EMAIL BADGE */}
                  {course.useremail && (
                    <span className="px-2 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700 font-medium">
                      {course.useremail}
                    </span>
                  )}

                  {/* 🗑 DELETED BADGE */}
                  {course.isDeleted && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
                      Deleted
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {course.level} • {course.category || "General"}
                </p>

                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                    course.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between mt-4 text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ FIX
                    handleView(course.cid);
                  }}
                  disabled={loadingCourse === course.cid}
                  className="text-emerald-600 hover:underline"
                >
                  {loadingCourse === course.cid ? "Opening..." : "View"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
