"use client";

import ChapterContent from "@/app/course/_components/ChapterContent";
import ChapterListSidebar from "@/app/course/_components/ChapterListSidebar";
import AppHeader from "@/app/workspace/_components/AppHeader";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { startLoading, stopLoading } from "@/app/components/RouteLoader";

function Course() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const topicRefs = useRef([]);
  const isFetchingRef = useRef(false); // Add ref to track API calls

  useEffect(() => {
    GetEnrolledCoursesById();
  }, [courseId]); // Add courseId dependency

  const GetEnrolledCoursesById = useCallback(async () => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    startLoading();
    
    try {
      console.log("courseId from params:", courseId);
      const result = await axios.get(`/api/enroll-course?courseId=${courseId}`);
      console.log("Enrolled Courses:", result.data);
      setCourseInfo(result.data);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError("Failed to load course. Please try again.");
    } finally {
      setIsLoading(false);
      stopLoading(); // Remove setTimeout
      isFetchingRef.current = false;
    }
  }, [courseId]); // Add courseId dependency

  // Updated refreshData to prevent duplicate calls
  const refreshData = useCallback((optimisticData) => {
    if (optimisticData) {
      // Use optimistic data immediately
      setCourseInfo(optimisticData);
    }
    
    // Only fetch if not already fetching
    if (!isFetchingRef.current) {
      GetEnrolledCoursesById();
    }
  }, [GetEnrolledCoursesById]); // Add dependency

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/30 to-blue-50/30">
        <AppHeader hideSidebar={true} />
        <div className="flex">
          {/* Sidebar skeleton */}
          <div className="fixed top-0 left-0 w-80 p-6 border-r border-emerald-200 h-screen overflow-hidden">
            <div className="animate-pulse">
              <div className="h-8 w-40 bg-emerald-200 rounded mb-6"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-4 p-4 border border-emerald-100 rounded-xl">
                  <div className="h-6 w-3/4 bg-emerald-200 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-emerald-100 rounded"></div>
                    <div className="h-4 w-2/3 bg-emerald-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main content skeleton */}
          <div className="ml-80 w-full p-8 md:p-10 lg:p-12">
            <div className="max-w-4xl mx-auto">
              {/* Header skeleton */}
              <div className="animate-pulse mb-8">
                <div className="h-10 w-64 bg-emerald-200 rounded mb-4"></div>
                <div className="h-6 w-48 bg-emerald-200 rounded"></div>
              </div>
              
              {/* Video section skeleton */}
              <div className="animate-pulse mb-12">
                <div className="h-8 w-48 bg-emerald-200 rounded mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="border border-emerald-100 rounded-xl p-4">
                      <div className="h-6 w-3/4 bg-emerald-200 rounded mb-3"></div>
                      <div className="aspect-video w-full bg-emerald-100 rounded-lg mb-2"></div>
                      <div className="h-4 w-24 bg-emerald-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Topics skeleton */}
              <div className="animate-pulse space-y-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 rounded-xl border border-emerald-100 bg-emerald-50">
                    <div className="h-7 w-56 bg-emerald-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-emerald-100 rounded"></div>
                      <div className="h-4 w-5/6 bg-emerald-100 rounded"></div>
                      <div className="h-4 w-4/5 bg-emerald-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
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

  // Show empty state
  if (!courseInfo) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/30 to-blue-50/30">
        <AppHeader hideSidebar={true} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Course Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The course you're looking for doesn't exist or you're not enrolled.
            </p>
            <a
              href="/workspace"
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium inline-block"
            >
              Back to Workspace
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/30 to-blue-50/30">
      <AppHeader hideSidebar={true} />
      <div className="flex gap-10">
        <ChapterListSidebar courseInfo={courseInfo} topicRefs={topicRefs} />
        <div className="ml-20 w-full">
          <ChapterContent 
            courseInfo={courseInfo} 
            refreshData={refreshData} 
            topicRefs={topicRefs} 
          />
        </div>
      </div>
    </div>
  );
}

export default Course;