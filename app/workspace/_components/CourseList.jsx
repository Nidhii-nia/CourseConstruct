"use client";

import { Button } from "@/components/ui/button";

import { PlusIcon, Loader2, RefreshCw, Sparkles } from "lucide-react";

import Image from "next/image";

import AddNewCourseDialogue from "./AddNewCourseDialogue";

import axios from "axios";

import { useUser } from "@clerk/nextjs";

import CourseCard from "./CourseCard";

import { useQuery } from "@tanstack/react-query";

import React, { useState, useEffect, useCallback } from "react";

function CourseList() {
  const { user } = useUser();

  /* =========================
     HYDRATION SAFETY
  ========================= */

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* =========================
     FETCH COURSES
  ========================= */

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

    enabled: mounted && !!user?.id,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 1,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,
  });

  /* =========================
     FETCH ENROLLMENTS
  ========================= */

  const {
    data: enrolledCourseList = [],

    refetch: refetchEnrollments,

    isFetching: isFetchingEnrollments,
  } = useQuery({
    queryKey: ["enrolledCourses"],

    queryFn: async () => {
      const res = await axios.get("/api/enroll-course");

      return res.data?.courses || [];
    },

    enabled: mounted && !!user?.id,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,
  });

  /* =========================
     REFRESH
  ========================= */

  const handleRefresh = useCallback(() => {
    refetchCourses();

    refetchEnrollments();
  }, [refetchCourses, refetchEnrollments]);

  /* =========================
     SSR FIX
  ========================= */

  if (!mounted) return null;

  /* =========================
     LOADING
  ========================= */

  if (isLoading) {
    return (
      <div className="space-y-5">
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between

            mt-6
          "
        >
          <h2
            className="
              text-2xl
              sm:text-3xl

              font-black

              text-emerald-800
              dark:text-emerald-300
            "
          >
            Course List
          </h2>
        </div>

        {/* LOADER */}
        <div
          className="
            flex
            flex-col
            items-center
            justify-center

            py-24

            rounded-3xl

            bg-white/80
            dark:bg-gray-900/70

            backdrop-blur-xl

            border
            border-emerald-100
            dark:border-emerald-500/20

            shadow-lg
          "
        >
          <div className="relative">
            <Loader2
              className="
                h-12
                w-12

                animate-spin

                text-emerald-600
                dark:text-emerald-300
              "
            />

            <div
              className="
                absolute
                inset-0

                rounded-full

                blur-xl

                bg-emerald-300/40

                opacity-50
              "
            />
          </div>

          <span
            className="
              mt-5

              text-lg
              font-semibold

              text-emerald-700
              dark:text-emerald-300
            "
          >
            Fetching Your Courses...
          </span>

          <p
            className="
              text-sm

              text-gray-500
              dark:text-gray-400

              mt-2
            "
          >
            Please wait while we load your learning workspace
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div
        className="
          mt-6

          rounded-3xl

          border
          border-red-200
          dark:border-red-500/20

          bg-red-50
          dark:bg-red-500/10

          p-6

          text-center
        "
      >
        <h3
          className="
            text-lg
            font-bold

            text-red-600
            dark:text-red-300
          "
        >
          Failed to load courses
        </h3>

        <p
          className="
            text-red-500
            dark:text-red-400

            mt-2
          "
        >
          Please try again later.
        </p>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div
        className="
          flex

          flex-col
          sm:flex-row

          sm:items-center
          sm:justify-between

          gap-4

          mt-6
        "
      >
        {/* TITLE */}
        <div>
          <h2
            className="
              text-2xl
              sm:text-3xl

              font-black

              text-emerald-800
              dark:text-emerald-300
            "
          >
            Course List
          </h2>

          <p
            className="
              text-sm

              text-gray-500
              dark:text-gray-400

              mt-1
            "
          >
            Manage and continue your tailored courses
          </p>
        </div>

        {/* REFRESH */}
        <button
          onClick={handleRefresh}
          className="
            flex
            items-center
            justify-center

            gap-2

            px-5
            py-3

            rounded-2xl

            bg-emerald-600
            hover:bg-emerald-700

            text-white

            font-medium

            shadow-lg
            hover:shadow-xl

            transition-all
            duration-300
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isFetchingCourses || isFetchingEnrollments ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* EMPTY STATE */}
      {courseList.length === 0 ? (
        <div
          className="
            border-2
            border-dashed

            border-emerald-200
            dark:border-emerald-500/20

            rounded-3xl

            mt-2

            bg-white/80
            dark:bg-gray-900/70

            backdrop-blur-xl

            shadow-lg

            overflow-hidden
          "
        >
          <div
            className="
              flex
              flex-col

              items-center
              justify-center

              py-14
              px-6

              text-center
            "
          >
            {/* IMAGE */}
            <div className="mb-8">
              <Image
                src="/learnpic.png"
                alt="No courses"
                width={220}
                height={220}
                className="
                  opacity-95

                  object-contain
                "
              />
            </div>

            {/* TEXT */}
            <h2
              className="
                text-2xl
                sm:text-3xl

                font-bold

                text-emerald-800
                dark:text-emerald-300

                mb-3
              "
            >
              No Courses Yet
            </h2>

            <p
              className="
                text-gray-600
                dark:text-gray-400

                mb-10

                max-w-md

                leading-relaxed
              "
            >
              Start your learning journey by creating your first AI-powered
              course.
            </p>

            {/* BUTTON */}
            <AddNewCourseDialogue>
              <Button
                className="
                  px-7
                  py-6

                  rounded-2xl

                  bg-gradient-to-r
                  from-emerald-600
                  to-green-600

                  hover:from-emerald-700
                  hover:to-green-700

                  text-white

                  shadow-xl
                  hover:shadow-2xl

                  transition-all
                  duration-300
                "
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your First Course
              </Button>
            </AddNewCourseDialogue>
          </div>
        </div>
      ) : (
        /* COURSE GRID */
        <div
          className="
    grid

    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    2xl:grid-cols-4

    gap-4

    justify-items-center
  "
        >
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
