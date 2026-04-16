"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import AddNewCourseDialogue from "./AddNewCourseDialogue";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function CourseList() {
  const { user } = useUser();

  // ✅ FIX: hydration safety
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all courses
  const {
    data: courseList = [],
    isLoading,
    error,
    refetch: refetchCourses,
    isFetching: isFetchingCourses,
  } = useQuery({
    queryKey: ["courses", "dashboard"],
    queryFn: async () => {
      const res = await axios.get("/api/courses");
      return res.data.courses || [];
    },
    enabled: mounted && !!user, // ✅ FIXED
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Fetch enrolled courses
  const {
    data: enrolledCourseList = [],
    refetch: refetchEnrollments,
    isFetching: isFetchingEnrollments,
  } = useQuery({
    queryKey: ["enrolledCourses"],
    queryFn: async () => {
      const res = await axios.get("/api/enroll-course");
      return res.data || [];
    },
    enabled: mounted && !!user, // ✅ FIXED
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // ✅ FIX: prevent SSR mismatch
  if (!mounted) return null;

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-emerald-950 mt-5 mb-4">
          Course List
        </h2>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-emerald-700 font-medium">
              Fetching Your Courses...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 mt-5">
        Failed to load courses. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* ✅ Header with Refresh */}
      <div className="flex items-center justify-between mt-5 mb-4">
        <h2 className="text-2xl font-bold text-emerald-950">
          Course List
        </h2>

        <button
          onClick={() => {
            refetchCourses();
            refetchEnrollments();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isFetchingCourses || isFetchingEnrollments
                ? "animate-spin"
                : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {courseList.length === 0 ? (
        <div className="border-2 border-dashed border-emerald-900 p-2 rounded-2xl mt-2 bg-white/50">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-8">
              <Image
                src="/learnpic.png"
                alt="No courses"
                width={200}
                height={200}
                className="opacity-90"
              />
            </div>
            <h2 className="text-xl font-semibold text-emerald-900 mb-3">
              No courses created yet
            </h2>
            <p className="text-emerald-700 mb-10 max-w-md">
              Get started by creating your first course to share knowledge
            </p>
            <AddNewCourseDialogue>
              <Button className="px-6 py-3">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Your First Course
              </Button>
            </AddNewCourseDialogue>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {courseList.map((course) => (
            <CourseCard
              key={course.cid}
              course={course}
              enrolledCourseList={enrolledCourseList}
              showDelete
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;