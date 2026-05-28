"use client";

import React, {
  useState,
} from "react";

import Image from "next/image";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";

import {
  PlaySquareIcon,
  Trash2,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

function EnrolledCourseCard({
  course,
  enrolledCourse,
  onUnenroll,
}) {

  const isUnavailable =
    course?.isDeleted;

  const [
    isUnenrolling,
    setIsUnenrolling,
  ] = useState(false);

  /* =========================================
     PROGRESS
  ========================================= */

  const calculatePerProgress =
    () => {

      const completed =
        enrolledCourse
          ?.completedChapters
          ?.length || 0;

      const total =
        course?.noOfChapters ||
        0;

      if (!total) return 0;

      return Math.min(
        100,
        Math.round(
          (completed / total) *
            100
        )
      );
    };

  const progress =
    calculatePerProgress();

  /* =========================================
     UNENROLL
  ========================================= */

  const handleUnenroll =
    async (e) => {

      e.preventDefault();

      e.stopPropagation();

      if (isUnenrolling)
        return;

      setIsUnenrolling(
        true
      );

      try {

        await onUnenroll?.(
          course?.cid
        );

      } catch (err) {

        console.error(err);

        toast.error(
          "Failed to unenroll. Try again."
        );

      } finally {

        setIsUnenrolling(
          false
        );
      }
    };

  return (
    <div
      className="
        relative
        group

        w-full
        max-w-77.5
      "
    >
      {/* =========================================
         UNENROLL BUTTON
      ========================================= */}

      {!isUnavailable && (
        <button
          onClick={
            handleUnenroll
          }
          disabled={
            isUnenrolling
          }
          className="
            absolute
            top-3
            right-3

            z-20

            flex
            items-center

            gap-2

            px-3
            py-1.5

            rounded-full

            border
            border-red-200
            dark:border-red-500/20

            bg-white/95
            dark:bg-gray-900/95

            backdrop-blur-md

            shadow-lg

            text-red-600
            dark:text-red-400

            hover:bg-red-50
            dark:hover:bg-red-500/10

            text-xs
            font-semibold

            transition-all

            disabled:opacity-50
          "
        >
          {isUnenrolling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Unenrolling...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />

              Unenroll
            </>
          )}
        </button>
      )}

      {/* =========================================
         CARD
      ========================================= */}

      <div
        className={`
          overflow-hidden

          rounded-3xl

          border
          border-emerald-200
          dark:border-emerald-500/20

          bg-white/90
          dark:bg-gray-900/90

          backdrop-blur-xl

          shadow-lg
          hover:shadow-2xl

          transition-all
          duration-300

          hover:-translate-y-1

          ${
            isUnavailable
              ? "blur-sm pointer-events-none opacity-70"
              : ""
          }
        `}
      >
        {/* =========================================
           IMAGE
        ========================================= */}

        <div className="relative overflow-hidden">

          <Image
            src={
              course?.bannerImgUrl ||
              "/books.png"
            }
            alt={
              course?.name ||
              "Course Banner"
            }
            width={320}
            height={180}
            className="
              w-full

              h-40

              object-cover

              transition-transform
              duration-700

              group-hover:scale-105
            "
          />

          {/* IMAGE OVERLAY */}
          <div
            className="
              absolute
              inset-0

              bg-gradient-to-t
              from-black/30
              via-transparent
              to-transparent
            "
          />
        </div>

        {/* =========================================
           CONTENT
        ========================================= */}

        <div className="p-5 space-y-4">

          {/* TITLE */}
          <h2
            className="
              text-lg

              font-bold

              leading-tight

              text-emerald-900
              dark:text-emerald-200

              line-clamp-2
            "
          >
            {course?.name}
          </h2>

          {/* DESCRIPTION */}
          <p
            className="
              line-clamp-3

              text-sm

              leading-relaxed

              text-gray-600
              dark:text-gray-400
            "
          >
            {course?.description ||
              course
                ?.courseJson
                ?.course
                ?.description ||
              "No description available"}
          </p>

          {/* =========================================
             PROGRESS
          ========================================= */}

          <div className="space-y-3">

            <div
              className="
                flex
                items-center
                justify-between

                text-sm

                font-medium
              "
            >
              <span
                className="
                  text-gray-700
                  dark:text-gray-300
                "
              >
                Progress
              </span>

              <span
                className="
                  text-emerald-700
                  dark:text-emerald-300

                  font-bold
                "
              >
                {progress}%
              </span>
            </div>

            {/* PROGRESS BAR */}
            <Progress
              value={progress}
              className="
                h-2.5

                bg-emerald-100
                dark:bg-gray-800
              "
            />

          </div>

          {/* =========================================
             BUTTON
          ========================================= */}

          <div className="pt-1">

            {isUnenrolling ? (
              <Button
                disabled={true}
                className="
                  w-full

                  rounded-2xl

                  bg-emerald-600

                  text-white

                  opacity-60
                "
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Unenrolling...
              </Button>
            ) : (
              <Link
                href={`/course/${course?.cid}`}
              >
                <Button
                  className="
                    w-full

                    rounded-2xl

                    bg-emerald-600
                    hover:bg-emerald-700

                    text-white

                    shadow-lg
                    hover:shadow-xl

                    transition-all
                  "
                >
                  <PlaySquareIcon className="mr-2 h-4 w-4" />

                  Resume Learning
                </Button>
              </Link>
            )}

          </div>
        </div>
      </div>

      {/* =========================================
         UNAVAILABLE OVERLAY
      ========================================= */}

      {isUnavailable && (
        <div
          className="
            absolute
            inset-0

            flex
            items-center
            justify-center

            rounded-3xl

            bg-black/30

            backdrop-blur-sm
          "
        >
          <div className="text-center px-4">

            <h2
              className="
                text-white

                text-lg

                font-bold
              "
            >
              Course Unavailable
            </h2>

            <p
              className="
                text-gray-200

                text-sm

                mt-1
              "
            >
              This course is not
              available right now
            </p>

          </div>
        </div>
      )}
    </div>
  );
}

export default EnrolledCourseCard;