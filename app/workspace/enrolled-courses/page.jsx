"use client";

import React from "react";

import EnrollCourseList from "../_components/EnrollCourseList";

import { useUser } from "@clerk/nextjs";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";

import {
  Loader2,
  RefreshCw,
  BookOpen,
} from "lucide-react";

import { toast } from "sonner";

function EnrolledCourses() {

  const { isLoaded, user } =
    useUser();

  const userEmail =
    user?.primaryEmailAddress
      ?.emailAddress;

  /* =========================================
     FETCH COURSES
  ========================================= */

  const {
    data = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({

    queryKey: [
      "enrolledCourses",
      userEmail,
    ],

    queryFn: async () => {

      const res =
        await axios.get(
          "/api/enroll-course"
        );

      return (
        res.data?.courses ||
        []
      );
    },

    enabled:
      isLoaded &&
      !!userEmail,

    staleTime:
      1000 * 60 * 5,

    gcTime:
      1000 * 60 * 30,

    refetchOnWindowFocus:
      false,

    refetchOnReconnect:
      false,

    retry: 1,
  });

  /* =========================================
     SAFE ARRAY
  ========================================= */

  const enrolledCourses =
    Array.isArray(data)
      ? data
      : [];

  /* =========================================
     UNENROLL
  ========================================= */

  const handleUnenroll =
    async (cid) => {

      try {

        await axios.delete(
          `/api/enroll-course?cid=${cid}`
        );

        await refetch();

        toast.success(
          "Unenrolled successfully"
        );

      } catch (err) {

        console.error(err);

        await refetch();

        if (
          err?.response?.status ===
          405
        ) {

          toast.error(
            "Unenroll not allowed (API method issue)"
          );

        } else if (
          err?.response?.status ===
          401
        ) {

          toast.error(
            "Please login again"
          );

        } else if (
          err?.response?.status ===
          404
        ) {

          toast.error(
            "Course not found or already removed"
          );

        } else if (
          !err?.response
        ) {

          toast.error(
            "No internet connection"
          );

        } else {

          toast.error(
            "Failed to unenroll. Try again."
          );
        }
      }
    };

  /* =========================================
     LOADING
  ========================================= */

  if (
    isLoading ||
    !isLoaded
  ) {

    return (
      <div
        className="
          min-h-[70vh]

          flex
          flex-col

          items-center
          justify-center

          gap-4
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
              dark:text-emerald-300
            "
          >
            Loading Courses...
          </h3>

          <p
            className="
              mt-1

              text-sm

              text-gray-500
              dark:text-gray-400
            "
          >
            Fetching your enrolled courses
          </p>

        </div>
      </div>
    );
  }

  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div
      className="
        min-h-screen

        p-4
        sm:p-6

        bg-gradient-to-br
        from-emerald-50
        via-white
        to-cyan-50

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950
      "
    >
      {/* HEADER */}
      <div
        className="
          mb-8

          flex
          flex-col
          md:flex-row

          md:items-center
          md:justify-between

          gap-5
        "
      >
        {/* LEFT */}
        <div
          className="
            flex
            items-center

            gap-4
          "
        >
          <div
            className="
              w-14
              h-14

              rounded-2xl

              bg-emerald-100
              dark:bg-emerald-500/10

              flex
              items-center
              justify-center
            "
          >
            <BookOpen
              className="
                h-7
                w-7

                text-emerald-700
                dark:text-emerald-300
              "
            />
          </div>

          <div>

            <h2
              className="
                text-3xl
                font-black

                text-emerald-900
                dark:text-emerald-300
              "
            >
              Enrolled Courses
            </h2>

            <p
              className="
                mt-1

                text-sm

                text-gray-600
                dark:text-gray-400
              "
            >
              {
                enrolledCourses.length
              }{" "}
              course
              {enrolledCourses.length !==
              1
                ? "s"
                : ""}
              {" "}
              enrolled
            </p>

          </div>
        </div>

        {/* REFRESH BUTTON */}
        <button
          onClick={refetch}
          className="
            flex
            items-center
            justify-center

            gap-2

            rounded-2xl

            bg-emerald-600
            hover:bg-emerald-700

            px-5
            py-3

            text-white

            font-semibold

            shadow-lg
            hover:shadow-xl

            transition-all
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isFetching
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* EMPTY STATE */}
      {enrolledCourses.length ===
        0 ? (
        <div
          className="
            flex
            flex-col

            items-center
            justify-center

            text-center

            rounded-3xl

            border
            border-dashed
            border-emerald-300
            dark:border-emerald-500/20

            bg-white/70
            dark:bg-gray-900/70

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

              text-emerald-800
              dark:text-emerald-300
            "
          >
            No Enrolled Courses
          </h3>

          <p
            className="
              mt-2

              max-w-md

              text-gray-500
              dark:text-gray-400
            "
          >
            You haven’t enrolled in any
            courses yet. Explore courses
            and start learning today.
          </p>
        </div>
      ) : (
        /* COURSE LIST */
        <EnrollCourseList
          enrolledCourseList={
            enrolledCourses
          }
          isLoading={
            isLoading
          }
          onUnenroll={
            handleUnenroll
          }
        />
      )}
    </div>
  );
}

export default EnrolledCourses;