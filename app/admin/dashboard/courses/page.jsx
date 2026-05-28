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

  // FETCH COURSES
  const fetchCourses = async (deleted = false) => {
    setLoading(true);

    try {
      const url = `/api/admin-courses${
        deleted ? "?showDeleted=true" : ""
      }`;

      console.log("📡 Fetching from:", url);

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

  // TOGGLE DELETED
  const handleToggleDeleted = () => {
    const newShowDeleted = !showDeleted;

    setShowDeleted(newShowDeleted);

    fetchCourses(newShowDeleted);
  };

  useEffect(() => {
    fetchCourses(false);
  }, []);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Courses
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and monitor all platform courses
          </p>
        </div>

        {/* TOGGLE BUTTON */}
        <button
          onClick={handleToggleDeleted}
          className={`
            px-4
            py-2

            rounded-xl

            text-sm
            font-medium

            transition-all
            duration-300

            shadow-sm
            hover:shadow-md

            w-full
            sm:w-auto

            ${
              showDeleted
                ? `
                  bg-red-100
                  dark:bg-red-500/20

                  text-red-700
                  dark:text-red-300

                  hover:bg-red-200
                  dark:hover:bg-red-500/30
                `
                : `
                  bg-gray-100
                  dark:bg-gray-800

                  text-gray-700
                  dark:text-gray-300

                  hover:bg-gray-200
                  dark:hover:bg-gray-700
                `
            }
          `}
        >
          {showDeleted ? "Back" : "Show Deleted"}
        </button>
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
      {!loading && courses.length === 0 && (
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
          No courses found
        </div>
      )}

      {/* GRID */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {courses.map((course) => (
            <div
              key={course.cid}
              className="
                bg-white/80
                dark:bg-gray-900/70

                backdrop-blur-xl

                rounded-3xl

                shadow-sm
                hover:shadow-xl

                border
                border-gray-100
                dark:border-gray-700

                p-5

                transition-all
                duration-300

                hover:-translate-y-1

                overflow-hidden
              "
            >
              {/* CONTENT */}
              <div
                onClick={() => handleView(course.cid)}
                className={`
                  cursor-pointer

                  transition-all

                  ${
                    loadingCourse === course.cid
                      ? "opacity-60 pointer-events-none"
                      : ""
                  }
                `}
              >
                {/* TITLE + BADGES */}
                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white break-words">
                    {course.name}
                  </h2>

                  {/* USER EMAIL */}
                  {course.useremail && (
                    <span
                      className="
                        px-2
                        py-0.5

                        text-[10px]

                        rounded-full

                        bg-blue-100
                        dark:bg-blue-500/20

                        text-blue-700
                        dark:text-blue-300

                        font-medium

                        break-all
                      "
                    >
                      {course.useremail}
                    </span>
                  )}

                  {/* DELETED */}
                  {course.isDeleted && (
                    <span
                      className="
                        px-2
                        py-0.5

                        rounded-full

                        text-[10px]
                        font-semibold

                        bg-red-100
                        dark:bg-red-500/20

                        text-red-700
                        dark:text-red-300
                      "
                    >
                      Deleted
                    </span>
                  )}
                </div>

                {/* META */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-words">
                  {course.level} •{" "}
                  {course.category || "General"}
                </p>

                {/* STATUS */}
                <span
                  className={`
                    inline-block

                    mt-3

                    px-3
                    py-1

                    text-xs

                    rounded-full

                    font-medium

                    ${
                      course.isPublished
                        ? `
                          bg-green-100
                          dark:bg-green-500/20

                          text-green-700
                          dark:text-green-300
                        `
                        : `
                          bg-gray-100
                          dark:bg-gray-800

                          text-gray-600
                          dark:text-gray-300
                        `
                    }
                  `}
                >
                  {course.isPublished
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-5">

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    handleView(course.cid);
                  }}
                  disabled={
                    loadingCourse === course.cid
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
                  {loadingCourse === course.cid
                    ? "Opening..."
                    : "View"}
                </button>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}