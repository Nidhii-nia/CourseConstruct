"use client";

import ChapterContent from "@/app/course/_components/ChapterContent";
import ChapterListSidebar from "@/app/course/_components/ChapterListSidebar";
import AppHeader from "@/app/workspace/_components/AppHeader";
import { SidebarProvider } from "@/context/SidebarContext";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

function Course() {
  const { courseId } = useParams();

  const [courseInfo, setCourseInfo] = useState(null);
  const [error, setError] = useState(null);

  const topicRefs = useRef([]);
  const isFetchingRef = useRef(false);

  // ✅ Fetch course data safely
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || isFetchingRef.current) return;

      isFetchingRef.current = true;
      setError(null);

      try {
        const res = await axios.get(
          `/api/enroll-course?courseId=${courseId}`
        );

        console.log("API DATA:", res.data);
setCourseInfo({
  ...res.data,

  // ✅ FIXED STRUCTURE
  courses: {
    courseContent: res.data.courseContent,
    includeVideo: res.data.includeVideo,
  },

  enrollCourse: res.data.enrollment,
});
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course. Please try again.");
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [courseId]);

  // ✅ Refresh function (used by child)
  const refreshData = (optimisticData) => {
    if (optimisticData) {
      setCourseInfo(optimisticData);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-linear-to-br from-emerald-50/30 to-blue-50/30">
        
        {/* HEADER */}
        <AppHeader hideSidebar={true} />

        {/* ❌ FULL PAGE ERROR */}
        {error && !courseInfo && (
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-semibold text-red-800 mb-3">
                Error Loading Course
              </h3>
              <p className="text-red-600 mb-6">{error}</p>

              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ⏳ LOADING */}
        {!courseInfo && !error && (
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading course...</p>
            </div>
          </div>
        )}

        {/* ✅ MAIN CONTENT */}
        {courseInfo && (
          <>
            {/* ⚠️ Error Banner */}
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 text-sm text-center">
                ⚠️ {error}
              </div>
            )}

            <div className="flex">
              <ChapterListSidebar
                courseInfo={courseInfo}
                topicRefs={topicRefs}
              />

              <div className="flex-1">
                <ChapterContent
                  courseInfo={courseInfo}
                  refreshData={refreshData}
                  topicRefs={topicRefs}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarProvider>
  );
}

export default Course;