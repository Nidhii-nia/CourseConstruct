"use client";

import React from "react";

import EnrolledCourseCard from "./EnrolledCourseCard";

import {
  Loader2,
  BookOpen,
} from "lucide-react";

function EnrollCourseList({
  enrolledCourseList,
  isLoading,
  onUnenroll,
}) {

  /* =========================================
     LOADING
  ========================================= */

  if (isLoading) {

    return (
      <div className="mt-5">

        {/* HEADER */}
        <div className="mb-5">

          <h2
            className="
              text-2xl
              md:text-3xl

              font-black

              text-emerald-900
              dark:text-emerald-200
            "
          >
            Continue Learning
          </h2>

          <p
            className="
              mt-1

              text-sm

              text-gray-600
              dark:text-gray-300
            "
          >
            Loading your enrolled courses
          </p>

        </div>

        {/* LOADER */}
        <div
          className="
            flex
            flex-col

            items-center
            justify-center

            gap-4

            rounded-3xl

            border
            border-emerald-200
            dark:border-emerald-500/20

            bg-white/80
            dark:bg-gray-900/80

            backdrop-blur-xl

            py-20

            shadow-xl
          "
        >
          <div
            className="
              p-5

              rounded-full

              bg-emerald-100
              dark:bg-emerald-500/10
            "
          >
            <Loader2
              className="
                h-8
                w-8

                animate-spin

                text-emerald-600
                dark:text-emerald-300
              "
            />
          </div>

          <div className="text-center">

            <h3
              className="
                text-lg
                font-bold

                text-emerald-800
                dark:text-emerald-200
              "
            >
              Fetching Courses...
            </h3>

            <p
              className="
                mt-1

                text-sm

                text-gray-600
                dark:text-gray-300
              "
            >
              Please wait a moment
            </p>

          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     EMPTY
  ========================================= */

  if (
    !enrolledCourseList?.length
  ) {

    return (
      <div className="mt-5">

        {/* HEADER */}
        <div className="mb-5">

          <h2
            className="
              text-2xl
              md:text-3xl

              font-black

              text-emerald-900
              dark:text-emerald-200
            "
          >
            Continue Learning
          </h2>

          <p
            className="
              mt-1

              text-sm

              text-gray-600
              dark:text-gray-300
            "
          >
            Your active learning space
          </p>

        </div>

        {/* EMPTY CARD */}
        <div
          className="
            flex
            flex-col

            items-center
            justify-center

            text-center

            rounded-3xl

            border-2
            border-dashed
            border-emerald-300
            dark:border-emerald-500/20

            bg-white/80
            dark:bg-gray-900/80

            backdrop-blur-xl

            py-20

            shadow-xl
          "
        >
          <div
            className="
              mb-5

              rounded-full

              bg-emerald-100
              dark:bg-emerald-500/10

              p-5
            "
          >
            <BookOpen
              className="
                h-10
                w-10

                text-emerald-700
                dark:text-emerald-300
              "
            />
          </div>

          <h3
            className="
              text-2xl
              font-bold

              text-emerald-900
              dark:text-emerald-200
            "
          >
            No Courses Yet
          </h3>

          <p
            className="
              mt-2

              max-w-md

              text-gray-600
              dark:text-gray-300
            "
          >
            You haven’t enrolled in any
            courses yet. Start exploring
            and continue your learning
            journey.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div className="mt-5">

      {/* HEADER */}
      <div className="mb-6">

        <h2
          className="
            text-2xl
            md:text-3xl

            font-black

            text-emerald-900
            dark:text-emerald-200
          "
        >
          Continue Learning
        </h2>

        <p
          className="
            mt-1

            text-sm

            text-gray-600
            dark:text-gray-300
          "
        >
          Pick up where you left off
        </p>

      </div>

      {/* GRID */}
      <div
        className="
          grid

          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          2xl:grid-cols-4

          gap-6

          justify-items-center
        "
      >
        {enrolledCourseList.map(
          (course) => (
            <EnrolledCourseCard
              key={course.cid}
              course={course}
              enrolledCourse={
                course.enrollment
              }
              onUnenroll={
                onUnenroll
              }
            />
          )
        )}
      </div>
    </div>
  );
}

export default EnrollCourseList;