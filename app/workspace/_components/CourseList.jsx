"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import AddNewCourseDialogue from "./AddNewCourseDialogue";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";
import { startLoading, stopLoading } from "@/app/components/RouteLoader";

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  const fetchCourses = async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      startLoading();
      
      const { data } = await axios.get("/api/courses");
      
      // Only update state if component is still mounted
      if (isMountedRef.current && data?.success) {
        setCourseList(data.courses || []);
        console.log("📚 Fetched Courses:", data.courses);
      }
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
      // Don't update state on error if component unmounted
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      stopLoading(); // Direct call without delay
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Only fetch courses if user exists
    if (user) {
      fetchCourses();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [user]); // Only depend on user

  const handleCourseCreated = () => {
    fetchCourses();
  };

  // Show loading state
  if (isLoading && courseList.length === 0) {
    return (
      <div className="w-full h-full p-4">
        <h2 className="text-3xl font-bold text-emerald-950 dark:text-white mb-4">
          Course List
        </h2>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <h2 className="text-3xl sm:text-3xl font-bold p-3 text-emerald-950 dark:text-white mb-3 sm:mb-4">
        Course List
      </h2>
      
      {courseList?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-4 sm:px-6 bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 transition-all hover:border-purple-400 dark:hover:border-purple-600 min-h-[400px] sm:h-[calc(100vh-200px)] sm:max-h-[600px]">
          {/* Content remains the same */}
          {/* ... */}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {courseList.map((course, index) => (
            <CourseCard course={course} key={course.cid || index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;