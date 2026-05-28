"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CourseDetailClient({
  course,
  cid,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  // DELETE
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin-courses/${cid}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            courseId: cid,
          }),
        }
      );

      let data;

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        toast.success("Course deleted");

        router.push(
          "/admin/dashboard/courses"
        );
      } else {
        toast.error(
          data.error || "Delete failed"
        );
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  // RESTORE
  const handleRestore = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin-courses/restore-course`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            courseId: cid,
          }),
        }
      );

      let data;

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        toast.success("Course restored");

        router.refresh();
      } else {
        toast.error(
          data.error || "Restore failed"
        );
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE PUBLISH
  const togglePublish = async () => {
    setLoading(true);

    const res = await fetch(
      `/api/courses/${cid}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          isPublished:
            !course.isPublished,
        }),
      }
    );

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      toast.error(
        data.error || "Action failed"
      );

      return;
    }

    toast.success("Updated");

    router.refresh();
  };

  const description =
    course.courseJson?.course
      ?.description ||
    course.description ||
    "--";

  return (
    <div
      className="
        p-4
        sm:p-6

        space-y-6

        relative
        z-10

        min-h-screen

        bg-gradient-to-br
        from-emerald-50/40
        via-white
        to-blue-50/40

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        transition-colors
        duration-500
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          flex-col
          lg:flex-row

          lg:items-center
          lg:justify-between

          gap-4
        "
      >
        {/* LEFT */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">

            <h1
              className="
                text-2xl
                font-bold

                text-gray-800
                dark:text-white

                break-words
              "
            >
              {course.name}
            </h1>

            {course.isDeleted && (
              <span
                className="
                  px-2
                  py-1

                  rounded-full

                  text-xs
                  font-semibold

                  bg-red-100
                  dark:bg-red-500/20

                  text-red-700
                  dark:text-red-300
                "
              >
                Deleted
              </span>
            )}
          </div>

          <p
            className="
              text-sm

              text-gray-500
              dark:text-gray-400

              mt-1

              break-words
            "
          >
            {course.level} •{" "}
            {course.category ||
              "General"}
          </p>
        </div>

        {/* ACTIONS */}
        <div
          className="
            flex
            flex-wrap

            gap-3

            relative
            z-10
          "
        >
          {!course.isDeleted && (
            <button
              onClick={() =>
                router.push(
                  `/workspace/edit-course/${cid}`
                )
              }
              className="
                px-4
                py-2

                text-sm

                rounded-xl

                bg-blue-600
                hover:bg-blue-700

                text-white

                transition-all
                duration-300

                shadow-sm
                hover:shadow-lg
              "
            >
              Edit
            </button>
          )}

          {course.isDeleted ? (
            <button
              onClick={
                handleRestore
              }
              disabled={loading}
              className={`
                px-4
                py-2

                text-sm

                rounded-xl

                text-white

                transition-all
                duration-300

                shadow-sm
                hover:shadow-lg

                ${
                  loading
                    ? `
                      bg-green-300
                      cursor-not-allowed
                    `
                    : `
                      bg-green-600
                      hover:bg-green-700
                    `
                }
              `}
            >
              {loading
                ? "Restoring..."
                : "Restore"}
            </button>
          ) : (
            <button
              onClick={
                handleDelete
              }
              disabled={loading}
              className={`
                px-4
                py-2

                text-sm

                rounded-xl

                text-white

                transition-all
                duration-300

                shadow-sm
                hover:shadow-lg

                ${
                  loading
                    ? `
                      bg-red-300
                      cursor-not-allowed
                    `
                    : `
                      bg-red-500
                      hover:bg-red-600
                    `
                }
              `}
            >
              {loading
                ? "Deleting..."
                : "Delete"}
            </button>
          )}
        </div>
      </div>

      {/* MAIN CARD */}
      <div
        className="
          bg-white/80
          dark:bg-gray-900/70

          backdrop-blur-xl

          rounded-3xl

          shadow-xl

          border
          border-gray-100
          dark:border-gray-700

          p-5
          sm:p-6

          flex
          flex-col
          xl:flex-row

          gap-8

          overflow-hidden
        "
      >
        {/* LEFT CONTENT */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* DESCRIPTION */}
          <div>
            <p
              className="
                text-sm
                font-medium

                text-gray-700
                dark:text-gray-300

                mb-2
              "
            >
              Description
            </p>

            <p
              className="
                text-sm

                text-gray-600
                dark:text-gray-400

                leading-relaxed

                break-words
              "
            >
              {description}
            </p>
          </div>

          {/* STATS */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2

              gap-4

              pt-5

              border-t
              border-gray-200
              dark:border-gray-700
            "
          >
            {/* CHAPTERS */}
            <div
              className="
                bg-gray-50
                dark:bg-gray-800/70

                rounded-2xl

                p-4
              "
            >
              <p
                className="
                  text-gray-500
                  dark:text-gray-400

                  text-sm
                "
              >
                Chapters
              </p>

              <p
                className="
                  font-bold
                  text-lg

                  text-gray-800
                  dark:text-white

                  mt-1
                "
              >
                {course.noOfChapters}
              </p>
            </div>

            {/* STATUS */}
            <div
              className="
                bg-gray-50
                dark:bg-gray-800/70

                rounded-2xl

                p-4
              "
            >
              <p
                className="
                  text-gray-500
                  dark:text-gray-400

                  text-sm
                "
              >
                Status
              </p>

              <div className="mt-2">
                <span
                  className={`
                    inline-flex
                    items-center

                    px-3
                    py-1

                    rounded-full

                    text-xs
                    font-medium

                    ${
                      course.isPublished
                        ? `
                          bg-green-100
                          dark:bg-green-500/20

                          text-green-700
                          dark:text-green-300
                        `
                        : `
                          bg-gray-100
                          dark:bg-gray-700

                          text-gray-600
                          dark:text-gray-300
                        `
                    }
                  `}
                >
                  {course.isPublished
                    ? "Published"
                    : "Draft"}
                </span>
              </div>
            </div>
          </div>

          {/* TOGGLE */}
          <div className="pt-2">
            <button
              onClick={
                togglePublish
              }
              disabled={
                !course.hasContent ||
                loading
              }
              className={`
                px-5
                py-2.5

                text-sm
                font-medium

                rounded-xl

                transition-all
                duration-300

                shadow-sm
                hover:shadow-lg

                ${
                  !course.hasContent
                    ? `
                      bg-gray-200
                      dark:bg-gray-700

                      text-gray-400
                      dark:text-gray-500

                      cursor-not-allowed
                    `
                    : course.isPublished
                    ? `
                      bg-gray-200
                      dark:bg-gray-700

                      text-gray-700
                      dark:text-gray-200
                    `
                    : `
                      bg-emerald-600
                      hover:bg-emerald-700

                      text-white
                    `
                }
              `}
            >
              {!course.hasContent
                ? "No Content"
                : course.isPublished
                ? "Unpublish"
                : "Publish"}
            </button>

            {!course.hasContent && (
              <p
                className="
                  text-xs

                  text-red-500
                  dark:text-red-400

                  mt-3
                "
              >
                Generate course
                content before
                publishing
              </p>
            )}
          </div>
        </div>

        {/* IMAGE */}
        {course.bannerImgUrl && (
          <div
            className="
              w-full
              xl:w-[320px]

              shrink-0
            "
          >
            <img
              src={
                course.bannerImgUrl
              }
              alt={course.name}
              className="
                w-full

                rounded-3xl

                object-cover

                shadow-lg

                pointer-events-none
              "
            />
          </div>
        )}
      </div>

      {/* DELETE DIALOG */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={
          setShowDeleteDialog
        }
      >
        <AlertDialogContent
          className="
            bg-white
            dark:bg-gray-900

            border
            border-gray-200
            dark:border-gray-700
          "
        >
          <AlertDialogHeader>

            <AlertDialogTitle
              className="
                text-gray-900
                dark:text-white
              "
            >
              Delete Course
            </AlertDialogTitle>

            <AlertDialogDescription
              className="
                text-gray-500
                dark:text-gray-400
              "
            >
              Are you sure you
              want to delete this
              course? This action
              cannot be undone.
            </AlertDialogDescription>

          </AlertDialogHeader>

          <div className="flex justify-end gap-3">

            <AlertDialogCancel
              className="
                dark:bg-gray-800
                dark:text-white
                dark:border-gray-700
              "
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={
                handleConfirmDelete
              }
              disabled={loading}
              className="
                bg-red-500
                hover:bg-red-600

                text-white
              "
            >
              {loading
                ? "Deleting..."
                : "Delete"}
            </AlertDialogAction>

          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}