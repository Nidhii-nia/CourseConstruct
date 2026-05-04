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

export default function CourseDetailClient({ course, cid }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 🗑 DELETE
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin-courses/${cid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: cid }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        toast.success("Course deleted");
        router.push("/admin/dashboard/courses");
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  // 🔄 RESTORE
  const handleRestore = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin-courses/restore-course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: cid }),
      });

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
        toast.error(data.error || "Restore failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 TOGGLE PUBLISH
  const togglePublish = async () => {
    setLoading(true);

    const res = await fetch(`/api/courses/${cid}`, {
      method: "PATCH",
      body: JSON.stringify({
        isPublished: !course.isPublished,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Action failed");
      return;
    }

    toast.success("Updated");
    router.refresh();
  };

  const description =
    course.courseJson?.course?.description || course.description || "--";

  return (
    <div className="p-4 sm:p-6 space-y-6 relative z-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{course.name}</h1>
            {course.isDeleted && (
              <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                Deleted
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {course.level} • {course.category || "General"}
          </p>
        </div>

        {/* ✅ FIXED BUTTON LAYER */}
        <div className="flex gap-3 relative z-10">
          {!course.isDeleted && (
            <button
              onClick={() => router.push(`/workspace/edit-course/${cid}`)}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit
            </button>
          )}

          {course.isDeleted ? (
            <button
              onClick={handleRestore}
              disabled={loading}
              className={`px-4 py-2 text-sm rounded-lg ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading ? "Restoring..." : "Restore"}
            </button>
          ) : (
            <button
              onClick={handleDelete}
              disabled={loading}
              className={`px-4 py-2 text-sm rounded-lg ${
                loading
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Description
            </p>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            <div>
              <p className="text-gray-500">Chapters</p>
              <p className="font-semibold">{course.noOfChapters}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  course.isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {course.isPublished ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          {/* 🔄 TOGGLE */}
          <button
            onClick={togglePublish}
            disabled={!course.hasContent || loading}
            className={`px-4 py-2 text-sm rounded-lg ${
              !course.hasContent
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : course.isPublished
                  ? "bg-gray-200 text-gray-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {!course.hasContent
              ? "No Content"
              : course.isPublished
                ? "Unpublish"
                : "Publish"}
          </button>

          {!course.hasContent && (
            <p className="text-xs text-red-500 mt-2">
              Generate course content before publishing
            </p>
          )}
        </div>

        {/* ✅ FIXED IMAGE CLICK BLOCK */}
        {course.bannerImgUrl && (
          <div className="w-full max-w-65 lg:max-w-[320px]">
            <img
              src={course.bannerImgUrl}
              className="rounded-xl w-full pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}