"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";

function EditCourse({viewCourse=false}) {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  const GetCourseInfo = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`/api/courses?courseId=${courseId}`);
      const data = res.data;
      
      if (Array.isArray(data.courses) && data.courses.length > 0) {
        setCourse(data.courses[0]);
      } else {
        setCourse(null);
        setError("Course not found");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setCourse(null);
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      GetCourseInfo();
    } else {
      setLoading(false);
      setError("No course ID");
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={GetCourseInfo}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Course Not Found</h3>
        </div>
      </div>
    );
  }

  const chapters = course?.courseJson?.course?.chapters || [];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <CourseInfo course={course} viewCourse={viewCourse} />
      </div>
      
      {chapters.length > 0 && (
        <div className="mt-10">
          <ChapterTopicList course={course} />
        </div>
      )}
      
      {chapters.length === 0 && !viewCourse && (
        <div className="mt-10 p-6 border border-amber-200 rounded-xl bg-amber-50 text-center">
          <p>No chapters yet. Click "Generate Content" above.</p>
        </div>
      )}
    </div>
  );
}

export default EditCourse;