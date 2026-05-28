"use client";

import { Button } from "@/components/ui/button";

import axios from "axios";

import {
  Book,
  PencilIcon,
  PlaySquareIcon,
  Plus,
  Trash2,
  Sparkles,
  Rocket,
} from "lucide-react";

import Image from "next/image";

import Link from "next/link";

import React, {
  useState,
  useEffect,
  useMemo,
} from "react";

import { toast } from "sonner";

import { useUser } from "@clerk/nextjs";

import { useQueryClient } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function CourseCard({
  course,
  enrolledCourseList = [],
  showDelete = false,
}) {
  const actualCourse =
    course?.courses ?? course;

  const isPublished =
    !!actualCourse?.isPublished;

  const [
    enrolling,
    setEnrolling,
  ] = useState(false);

  const [
    localEnrolled,
    setLocalEnrolled,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const { isSignedIn } =
    useUser();

  const queryClient =
    useQueryClient();

  const isDeleted =
    actualCourse?.isDeleted ===
    true;

  const enrolledSet =
    useMemo(
      () =>
        new Set(
          Array.isArray(
            enrolledCourseList
          )
            ? enrolledCourseList.map(
                (item) =>
                  item?.cid ||
                  item
                    ?.courses
                    ?.cid
              )
            : []
        ),
      [enrolledCourseList]
    );

  /* =========================
     ENROLL CHECK
  ========================= */

  const isEnrolled =
    enrolledSet.has(
      actualCourse?.cid
    );

  useEffect(() => {
    setLocalEnrolled(
      !!isEnrolled
    );
  }, [isEnrolled]);

  /* =========================
     PUBLISH
  ========================= */

  const handlePublishCourse =
    async () => {
      try {
        setPublishing(true);

        await axios.patch(
          "/api/courses/publish",
          {
            cid:
              actualCourse?.cid,

            publish: true,
          }
        );

        toast.success(
          "🚀 Course Published"
        );

        queryClient.setQueryData(
          ["courses"],
          (old = []) => {
            return old.map(
              (item) => {
                const course =
                  item?.courses ||
                  item;

                if (
                  course?.cid ===
                  actualCourse?.cid
                ) {
                  return {
                    ...item,

                    courses: {
                      ...item.courses,

                      isPublished: true,
                    },
                  };
                }

                return item;
              }
            );
          }
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "courses",
            ],
          }
        );
      } catch (error) {
        toast.error(
          "Failed to publish course"
        );
      } finally {
        setPublishing(false);
      }
    };

  /* =========================
     DELETE
  ========================= */

  const handleDeleteCourse =
    async () => {
      try {
        setDeleting(true);

        await axios.delete(
          "/api/delete-course",
          {
            data: {
              courseId:
                actualCourse?.cid,
            },
          }
        );

        queryClient.setQueryData(
          [
            "courses",
            "dashboard",
          ],
          (old = []) =>
            old.filter(
              (item) => {
                if (
                  item?.cid ===
                  actualCourse?.cid
                ) {
                  return false;
                }

                if (
                  item?.courses
                    ?.cid ===
                  actualCourse?.cid
                ) {
                  return false;
                }

                return true;
              }
            )
        );

        toast.success(
          "🗑 Course deleted"
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "courses",
              "dashboard",
            ],
          }
        );
      } catch (error) {
        toast.error(
          "Failed to delete course"
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =========================
     ENROLL
  ========================= */

  const onEnrollCourse =
    async () => {
      try {
        setEnrolling(true);

        await axios.post(
          "/api/enroll-course",
          {
            courseId:
              actualCourse?.cid,
          }
        );

        setLocalEnrolled(
          true
        );

        toast.success(
          "Successfully Enrolled!"
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "enrolledCourses",
            ],
          }
        );
      } catch (e) {
        toast.error(
          "Failed to enroll"
        );
      } finally {
        setEnrolling(false);
      }
    };

  return (
    <div
      className="
        relative
        group

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
        duration-500

        hover:-translate-y-1

        max-w-sm
        w-full
      "
    >
      {/* TOP GLOW */}
      <div
        className="
          absolute
          inset-0

          opacity-0
          group-hover:opacity-100

          transition-opacity
          duration-500

          bg-gradient-to-br
          from-emerald-500/5
          via-transparent
          to-green-500/5

          pointer-events-none
        "
      />

      {/* PUBLISHED BADGE */}
      {isPublished && (
        <div
          className="
            absolute
            top-3
            left-3

            z-20

            flex
            items-center
            gap-1

            px-3
            py-1.5

            rounded-full

            bg-green-600

            text-white

            text-xs
            font-semibold

            shadow-lg
          "
        >
          <Rocket className="w-3 h-3" />

          Published
        </div>
      )}

      {/* EDIT + DELETE */}
      {showDelete &&
        !isDeleted && (
          <div
            className="
              absolute
              top-3
              right-3

              z-20

              flex
              items-center

              gap-2
            "
          >
            {/* EDIT */}
            <Link
              href={`/workspace/edit-course/${actualCourse?.cid}`}
            >
              <button
                className="
                  p-2.5

                  rounded-full

                  bg-blue-500/90
                  hover:bg-blue-600

                  text-white

                  shadow-md

                  transition-all
                "
              >
                <PencilIcon size={15} />
              </button>
            </Link>

            {/* DELETE */}
            <AlertDialog>

              <AlertDialogTrigger asChild>

                <button
                  className="
                    p-2.5

                    rounded-full

                    bg-red-500/90
                    hover:bg-red-600

                    text-white

                    shadow-md

                    transition-all
                  "
                >
                  <Trash2 size={15} />
                </button>

              </AlertDialogTrigger>

              <AlertDialogContent
                className="
                  rounded-3xl

                  border
                  border-emerald-200
                  dark:border-emerald-500/20

                  bg-white
                  dark:bg-gray-900
                "
              >
                <AlertDialogHeader>

                  <AlertDialogTitle
                    className="
                      text-xl

                      text-red-600
                    "
                  >
                    Delete Course?
                  </AlertDialogTitle>

                  <AlertDialogDescription
                    className="
                      dark:text-gray-400
                    "
                  >
                    This action
                    cannot be
                    undone. This
                    will permanently
                    delete your
                    course.
                  </AlertDialogDescription>

                </AlertDialogHeader>

                <AlertDialogFooter>

                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={
                      handleDeleteCourse
                    }
                    className="
                      bg-red-600
                      hover:bg-red-700
                    "
                  >
                    {deleting
                      ? "Deleting..."
                      : "Delete"}
                  </AlertDialogAction>

                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

      {/* PUBLISH BUTTON */}
      {showDelete &&
        !isDeleted &&
        !isPublished &&
        actualCourse?.hasContent && (
          <div
            className="
              absolute
              top-3
              left-3

              z-20
            "
          >
            <button
              onClick={
                handlePublishCourse
              }
              disabled={
                publishing
              }
              className="
                px-3
                py-1.5

                rounded-full

                bg-green-600
                hover:bg-green-700

                text-white

                text-xs
                font-semibold

                shadow-lg

                disabled:opacity-60

                transition-all
              "
            >
              {publishing
                ? "Publishing..."
                : "Publish"}
            </button>
          </div>
        )}

      {/* IMAGE */}
      <div className="relative overflow-hidden">

        <Image
          src={
            actualCourse?.bannerImgUrl ||
            "/books.png"
          }
          alt={
            actualCourse?.name ||
            "Course banner"
          }
          width={400}
          height={220}
          className="
            w-full

            h-48

            object-cover

            transition-transform
            duration-700

            group-hover:scale-105
          "
        />

        {/* OVERLAY */}
        <div
          className="
            absolute
            inset-0

            bg-gradient-to-t
            from-black/40
            via-transparent
            to-transparent
          "
        />
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-4">

        {/* TITLE */}
        <div>

          <h2
            className="
              text-xl

              font-bold

              text-emerald-800
              dark:text-emerald-300

              line-clamp-2
            "
          >
            {actualCourse?.name}
          </h2>

        </div>

        {/* DESCRIPTION */}
        <p
          className="
            line-clamp-3

            text-sm

            text-gray-600
            dark:text-gray-400

            leading-relaxed
          "
        >
          {actualCourse?.description ||
            "No description available"}
        </p>

        {/* CHAPTERS */}
        <div
          className="
            flex
            items-center

            gap-2

            text-sm

            text-emerald-600
            dark:text-emerald-300
          "
        >
          <Book size={17} />

          <span className="font-medium">
            {
              actualCourse?.noOfChapters
            }{" "}
            Chapters
          </span>
        </div>

        {/* BUTTON */}
        <div className="pt-2">

          {isDeleted ? (
            <div
              className="
                w-full

                py-3

                rounded-2xl

                bg-red-100
                dark:bg-red-500/10

                text-red-600
                dark:text-red-300

                text-center

                text-sm
                font-semibold
              "
            >
              🚫 Course Unavailable
            </div>
          ) : actualCourse?.hasContent ? (
            enrolling ? (
              <Button
                disabled
                className="
                  w-full

                  rounded-2xl

                  bg-gray-400
                "
              >
                Enrolling...
              </Button>
            ) : localEnrolled ? (
              <Link
                href={`/course/${actualCourse?.cid}`}
              >
                <Button
                  className="
                    w-full

                    rounded-2xl

                    bg-green-600
                    hover:bg-green-700

                    text-white

                    shadow-lg
                  "
                >
                  <PlaySquareIcon
                    size={17}
                  />

                  Resume Course
                </Button>
              </Link>
            ) : !isSignedIn ? (
              <Button
                disabled
                className="
                  w-full

                  rounded-2xl

                  bg-gray-500
                "
              >
                Login Required
              </Button>
            ) : (
              <Button
                onClick={
                  onEnrollCourse
                }
                className="
                  w-full

                  rounded-2xl

                  bg-emerald-600
                  hover:bg-emerald-700

                  text-white

                  shadow-lg
                "
              >
                Enroll Now
              </Button>
            )
          ) : (
            <Link
              href={`/workspace/edit-course/${actualCourse?.cid}`}
            >
              <Button
                size="sm"
                className="
                  w-full

                  rounded-2xl

                  bg-gradient-to-r
                  from-emerald-600
                  to-green-600

                  hover:from-emerald-700
                  hover:to-green-700

                  text-white

                  shadow-lg
                "
              >
                <Plus className="mr-1 w-4 h-4" />

                Generate Course
              </Button>
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}

export default CourseCard;