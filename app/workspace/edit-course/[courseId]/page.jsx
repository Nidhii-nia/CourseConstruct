"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";
import { startLoading, stopLoading } from "@/app/components/RouteLoader";

function EditCourse({viewCourse=false}) {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const GetCourseInfo = async () => {
    // Prevent multiple calls
    if (loading || !courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      startLoading();
      
      const res = await axios.get(`/api/courses?courseId=${courseId}`);
      const data = res.data;
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          setCourse(data.courses[0]);
        } else {
          setCourse(null);
          setError("Course not found");
        }
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setCourse(null);
        setError("Failed to load course. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      stopLoading(); // Direct call without delay
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    if (courseId) {
      GetCourseInfo();
    } else {
      // Handle missing courseId immediately
      setLoading(false);
      setError("No course ID provided");
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [courseId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">
            Loading Course
          </h3>
          <p className="text-emerald-600">
            Fetching course information...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading Course
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={GetCourseInfo}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Course Not Found
          </h3>
          <p className="text-gray-600">
            The course you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const chapters = Array.isArray(course?.courseJson?.course?.chapters)
    ? course.courseJson.course.chapters
    : [];

  return (
    <div className="p-4 md:p-6">
      {/* Course Info Section */}
      <div className="mb-8">
        <CourseInfo course={course} viewCourse={viewCourse} />
      </div>
      
      {/* Chapter Topics Section - Only show if chapters exist */}
      {chapters.length > 0 && (
        <div className="mt-10">
          <ChapterTopicList course={course} />
        </div>
      )}
      
      {/* No Chapters Message */}
      {chapters.length === 0 && !viewCourse && (
        <div className="mt-10 p-6 border border-amber-200 rounded-xl bg-amber-50 text-center">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            No Chapters Yet
          </h3>
          <p className="text-amber-600">
            This course doesn't have any chapters yet. Click "Generate Content" above to create chapters and topics.
          </p>
        </div>
      )}
    </div>
  );
}

export default EditCourse;