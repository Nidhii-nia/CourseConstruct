"use client";

import ChapterContent from "@/app/course/_components/ChapterContent";

import ChapterListSidebar from "@/app/course/_components/ChapterListSidebar";

import AppHeader from "@/app/workspace/_components/AppHeader";

import { SidebarProvider } from "@/context/SidebarContext";

import axios from "axios";

import { useParams } from "next/navigation";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

function Course() {
  const { courseId } =
    useParams();

  const [courseInfo, setCourseInfo] =
    useState(null);

  const [error, setError] =
    useState(null);

  const topicRefs = useRef([]);

  const isFetchingRef =
    useRef(false);

  /* =========================
     FETCH COURSE
  ========================= */

  useEffect(() => {
    const fetchData =
      async () => {
        if (
          !courseId ||
          isFetchingRef.current
        )
          return;

        isFetchingRef.current =
          true;

        setError(null);

        try {
          const res =
            await axios.get(
              `/api/enroll-course?courseId=${courseId}`
            );

          const courseData =
            res.data?.courses?.[0];

          if (!courseData) {
            setCourseInfo(null);

            return;
          }

          setCourseInfo({
            ...courseData,

            courses: {
              courseContent:
                courseData.courseContent ||
                [],

              includeVideo:
                courseData.includeVideo ||
                false,

              courseName:
                courseData.name,
            },

            enrollCourse:
              courseData.enrollment ||
              {
                completedChapters:
                  [],
              },
          });
        } catch (err) {
          console.error(
            "Error fetching course:",
            err
          );

          setError(
            "Failed to load course. Please try again."
          );
        } finally {
          isFetchingRef.current =
            false;
        }
      };

    fetchData();
  }, [courseId]);

  /* =========================
     REFRESH
  ========================= */

  const refreshData =
    useCallback(
      (optimisticData) => {
        if (optimisticData) {
          setCourseInfo(
            optimisticData
          );
        }
      },
      []
    );

  return (
    <SidebarProvider>
      <div
        className="
          min-h-screen

          bg-gradient-to-br
          from-emerald-50/30
          via-white
          to-blue-50/30

          dark:from-gray-950
          dark:via-gray-900
          dark:to-emerald-950

          transition-colors
          duration-500
        "
      >
        {/* HEADER */}
        <AppHeader
          hideSidebar={true}
        />

        {/* =========================
            FULL PAGE ERROR
        ========================= */}

        {error && !courseInfo && (
          <div
            className="
              flex
              items-center
              justify-center

              min-h-[calc(100vh-80px)]

              px-4
            "
          >
            <div
              className="
                text-center

                max-w-md

                bg-white/80
                dark:bg-gray-900/70

                backdrop-blur-xl

                rounded-3xl

                shadow-2xl

                border
                border-red-100
                dark:border-red-500/20

                p-8
              "
            >
              <div
                className="
                  w-16
                  h-16

                  mx-auto
                  mb-5

                  rounded-full

                  bg-red-100
                  dark:bg-red-500/20

                  flex
                  items-center
                  justify-center

                  text-3xl
                "
              >
                ⚠️
              </div>

              <h3
                className="
                  text-2xl
                  font-semibold

                  text-red-800
                  dark:text-red-300

                  mb-3
                "
              >
                Error Loading
                Course
              </h3>

              <p
                className="
                  text-red-600
                  dark:text-red-400

                  mb-6

                  leading-relaxed
                "
              >
                {error}
              </p>

              <button
                onClick={() =>
                  window.location.reload()
                }
                className="
                  px-6
                  py-3

                  rounded-2xl

                  bg-emerald-500
                  hover:bg-emerald-600

                  text-white

                  font-medium

                  shadow-lg
                  hover:shadow-xl

                  transition-all
                  duration-300
                "
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {!courseInfo &&
          !error && (
            <div
              className="
                flex
                items-center
                justify-center

                min-h-[calc(100vh-80px)]

                px-4
              "
            >
              <div
                className="
                  text-center

                  bg-white/80
                  dark:bg-gray-900/70

                  backdrop-blur-xl

                  rounded-3xl

                  shadow-xl

                  border
                  border-gray-100
                  dark:border-gray-700

                  px-8
                  py-7
                "
              >
                <div
                  className="
                    w-8
                    h-8

                    border-[3px]

                    border-gray-300
                    dark:border-gray-700

                    border-t-emerald-500

                    rounded-full

                    animate-spin

                    mx-auto
                    mb-4
                  "
                ></div>

                <p
                  className="
                    text-gray-500
                    dark:text-gray-400

                    text-sm
                  "
                >
                  Loading
                  course...
                </p>
              </div>
            </div>
          )}

        {/* =========================
            MAIN CONTENT
        ========================= */}

        {courseInfo && (
          <>
            {/* ERROR BANNER */}
            {error && (
              <div
                className="
                  mx-4
                  mt-4

                  rounded-2xl

                  bg-red-100/90
                  dark:bg-red-500/10

                  border
                  border-red-200
                  dark:border-red-500/20

                  text-red-700
                  dark:text-red-300

                  px-4
                  py-3

                  text-sm
                  text-center

                  backdrop-blur-md
                "
              >
                ⚠️ {error}
              </div>
            )}

            {/* CONTENT LAYOUT */}
            <div
              className="
                flex

                flex-col
                lg:flex-row

                overflow-hidden
              "
            >
              {/* SIDEBAR */}
              <div
                className="
                  lg:sticky
                  lg:top-0

                  lg:h-screen

                  shrink-0

                  z-20
                "
              >
                <ChapterListSidebar
                  courseInfo={
                    courseInfo
                  }
                  topicRefs={
                    topicRefs
                  }
                />
              </div>

              {/* MAIN CONTENT */}
              <div
                className="
                  flex-1

                  min-w-0

                  overflow-hidden
                "
              >
                <ChapterContent
                  courseInfo={
                    courseInfo
                  }
                  refreshData={
                    refreshData
                  }
                  topicRefs={
                    topicRefs
                  }
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