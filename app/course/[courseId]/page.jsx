"use client";

import ChapterContent from "@/app/course/_components/ChapterContent";
import ChapterListSidebar from "@/app/course/_components/ChapterListSidebar";
import AppHeader from "@/app/workspace/_components/AppHeader";
import { SidebarProvider } from "@/context/SidebarContext";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";

function Course() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [error, setError] = useState(null);
  const topicRefs = useRef([]);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    GetEnrolledCoursesById();
  }, [courseId]);

  const GetEnrolledCoursesById = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setError(null);
    
    try {
      const result = await axios.get(`/api/enroll-course?courseId=${courseId}`);
      setCourseInfo(result.data);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError("Failed to load course. Please try again.");
    } finally {
      isFetchingRef.current = false;
    }
  }, [courseId]);

  const refreshData = useCallback((optimisticData) => {
    if (optimisticData) {
      setCourseInfo(optimisticData);
    }
    
    if (!isFetchingRef.current) {
      GetEnrolledCoursesById();
    }
  }, [GetEnrolledCoursesById]);

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/30 to-blue-50/30">
        <AppHeader hideSidebar={true} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-semibold text-red-800 mb-3">
              Error Loading Course
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={GetEnrolledCoursesById}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

if (!courseInfo && !error) {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/30 to-blue-50/30">
      <AppHeader hideSidebar={true} />
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center">
          {/* EXTRA SMALL SPINNER */}
          <div className="w-6 h-6 mx-auto mb-2">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-emerald-950-500 animate-spin"></div>
          </div>
          <p className="text-gray-500 text-xs">Loading...</p>
        </div>
      </div>
    </div>
  );
}

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-linear-to-br from-emerald-50/30 to-blue-50/30">
        <AppHeader hideSidebar={true} />
        <div className="flex">
          <ChapterListSidebar courseInfo={courseInfo} topicRefs={topicRefs} />
          <div className="flex-1">
            <ChapterContent 
              courseInfo={courseInfo} 
              refreshData={refreshData} 
              topicRefs={topicRefs} 
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Course;