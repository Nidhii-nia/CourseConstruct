"use client";

import axios from "axios";

import { useParams } from "next/navigation";

import React, {
  useEffect,
  useState,
} from "react";

import CourseInfo from "../_components/CourseInfo";

import ChapterTopicList from "../_components/ChapterTopicList";

import {
  Loader2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

function EditCourse({
  viewCourse = false,
}) {
  const { courseId } =
    useParams();

  const [loading, setLoading] =
    useState(true);

  const [course, setCourse] =
    useState(null);

  const [error, setError] =
    useState(null);

  /* =========================
     FETCH COURSE
  ========================= */

  const GetCourseInfo =
    async () => {
      if (!courseId) return;

      try {
        setLoading(true);

        setError(null);

        const res =
          await axios.get(
            `/api/courses?courseId=${courseId}`
          );

        const data =
          res.data;

        if (
          Array.isArray(
            data.courses
          ) &&
          data.courses
            .length > 0
        ) {
          setCourse(
            data.courses[0]
          );
        } else {
          setCourse(null);

          setError(
            "Course not found"
          );
        }
      } catch (err) {
        console.error(
          "Fetch failed:",
          err
        );

        setCourse(null);

        setError(
          "Failed to load course"
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================
     LOAD
  ========================= */

  useEffect(() => {
    if (courseId) {
      GetCourseInfo();
    } else {
      setLoading(false);

      setError(
        "No course ID"
      );
    }
  }, [courseId]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div
        className="
          min-h-screen

          flex
          items-center
          justify-center

          px-4

          bg-linear-to-br
          from-emerald-50
          via-white
          to-cyan-50

          dark:from-gray-950
          dark:via-gray-900
          dark:to-emerald-950
        "
      >
        <div
          className="
            flex
            flex-col
            items-center

            gap-5

            p-8

            rounded-3xl

            bg-white/80
            dark:bg-gray-900/80

            backdrop-blur-xl

            border
            border-emerald-100
            dark:border-emerald-500/20

            shadow-2xl
          "
        >
          <div className="relative">

            <Loader2
              className="
                h-14
                w-14

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

                bg-emerald-300

                opacity-20

                blur-2xl
              "
            />

          </div>

          <div className="text-center">

            <h3
              className="
                text-xl
                font-bold

                text-emerald-700
                dark:text-emerald-300
              "
            >
              Loading Course...
            </h3>

            <p
              className="
                text-sm

                text-gray-500
                dark:text-gray-400

                mt-2
              "
            >
              Preparing your
              learning workspace
            </p>

          </div>
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
          min-h-screen

          flex
          items-center
          justify-center

          px-4

          bg-linear-to-br
          from-red-50
          via-white
          to-rose-50

          dark:from-gray-950
          dark:via-gray-900
          dark:to-red-950
        "
      >
        <div
          className="
            max-w-md
            w-full

            text-center

            rounded-3xl

            bg-white/90
            dark:bg-gray-900/80

            backdrop-blur-xl

            border
            border-red-100
            dark:border-red-500/20

            shadow-2xl

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

              flex
              items-center
              justify-center

              bg-red-100
              dark:bg-red-500/10
            "
          >
            <AlertTriangle
              className="
                w-8
                h-8

                text-red-600
                dark:text-red-300
              "
            />
          </div>

          <h3
            className="
              text-2xl
              font-bold

              text-red-700
              dark:text-red-300

              mb-3
            "
          >
            Error
          </h3>

          <p
            className="
              text-red-500
              dark:text-red-400

              mb-6
            "
          >
            {error}
          </p>

          <button
            onClick={
              GetCourseInfo
            }
            className="
              px-6
              py-3

              rounded-2xl

              bg-emerald-600
              hover:bg-emerald-700

              text-white

              font-medium

              shadow-lg

              transition-all
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     NO COURSE
  ========================= */

  if (!course) {
    return (
      <div
        className="
          min-h-screen

          flex
          items-center
          justify-center

          px-4

          bg-linear-to-br
          from-emerald-50
          via-white
          to-cyan-50

          dark:from-gray-950
          dark:via-gray-900
          dark:to-emerald-950
        "
      >
        <div
          className="
            text-center

            rounded-3xl

            bg-white/90
            dark:bg-gray-900/80

            backdrop-blur-xl

            border
            border-emerald-100
            dark:border-emerald-500/20

            shadow-2xl

            p-10
          "
        >
          <BookOpen
            className="
              w-14
              h-14

              mx-auto
              mb-5

              text-emerald-600
              dark:text-emerald-300
            "
          />

          <h3
            className="
              text-2xl
              font-bold

              text-emerald-700
              dark:text-emerald-300
            "
          >
            Course Not Found
          </h3>
        </div>
      </div>
    );
  }

  const chapters =
    course?.courseJson
      ?.course?.chapters ||
    [];

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div
      className="
        min-h-screen

        px-4
        md:px-6

        py-6

        bg-linear-to-br
        from-emerald-50
        via-white
        to-cyan-50

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950
      "
    >
      {/* COURSE INFO */}
      <div className="mb-8">

        <CourseInfo
          course={course}
          viewCourse={
            viewCourse
          }
        />

      </div>

      {/* CHAPTERS */}
      {chapters.length >
        0 && (
        <div className="mt-10">

          <ChapterTopicList
            course={course}
          />

        </div>
      )}

      {/* EMPTY */}
      {chapters.length ===
        0 &&
        !viewCourse && (
          <div
            className="
              mt-10

              rounded-3xl

              border
              border-amber-200
              dark:border-amber-500/20

              bg-amber-50
              dark:bg-amber-500/10

              shadow-lg

              p-8

              text-center
            "
          >
            <h3
              className="
                text-xl
                font-bold

                text-amber-700
                dark:text-amber-300

                mb-3
              "
            >
              No Chapters Yet
            </h3>

            <p
              className="
                text-amber-600
                dark:text-amber-200
              "
            >
              Click "Generate
              Content" above to
              create your course
              material.
            </p>
          </div>
        )}
    </div>
  );
}

export default EditCourse;