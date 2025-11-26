"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddNewCourseDialogue from "./AddNewCourseDialogue";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // 🧠 Fetch all courses from DB
  const fetchCourses = async () => {
    try {
      const { data } = await axios.get("/api/courses");
      if (data?.success) {
        setCourseList(data.courses || []);

        // Log all courses
        console.log("📚 Fetched Courses:", data.courses);
      }
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // When a new course is created, refresh list
  const handleCourseCreated = () => {
    fetchCourses();
  };

  useEffect(() => {
    user && GetCourseList();
  }, [user]);
  const GetCourseList = async () => {
    const result = await axios.get("/api/courses");
    console.log(result.data);
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
        Course List
      </h2>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center h-[300px] text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      ) : courseList?.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-4 sm:px-6 bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 transition-all hover:border-purple-400 dark:hover:border-purple-600 min-h-[400px] sm:h-[calc(100vh-200px)] sm:max-h-[600px]">
          <div className="relative mb-3 sm:mb-4 transform transition-transform hover:scale-105">
            <div className="absolute inset-0 bg-purple-400 blur-2xl opacity-20 rounded-full"></div>
            <Image
              src="/learnpic.png"
              alt="education"
              width={150}
              height={150}
              className="relative z-10 drop-shadow-lg"
            />
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No Courses Yet
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center max-w-md mb-4 px-4">
            Start your learning journey by creating your first course. Click the
            button below to get started!
          </p>

          <AddNewCourseDialogue onCourseCreated={handleCourseCreated}>
            <Button className="px-5 sm:px-6 py-2 sm:py-2.5 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium text-sm sm:text-base rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Your First Course
            </Button>
          </AddNewCourseDialogue>
        </div>
      ) : (
        /* Course Grid - when courses exist */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {courseList.map((course, index) => (
            <CourseCard course={course} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;
