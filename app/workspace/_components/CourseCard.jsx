"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Book, PencilIcon, PlaySquareIcon, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
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

function CourseCard({ course, enrolledCourseList = [], showDelete = false }) {
  const actualCourse = course?.courses ?? course;

  const isPublished = !!actualCourse?.isPublished;

  const [enrolling, setEnrolling] = useState(false);
  const [localEnrolled, setLocalEnrolled] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();

  const isDeleted = actualCourse?.isDeleted === true;

  // ✅ check enrollment properly
  const isEnrolled = enrolledCourseList?.some(
    (item) =>
      item?.cid === actualCourse?.cid ||
      item?.courses?.cid === actualCourse?.cid,
  );

  // ✅ sync local state with backend
  useEffect(() => {
    setLocalEnrolled(!!isEnrolled);
  }, [isEnrolled]);

  ///publish course
  const handlePublishCourse = async () => {
    try {
      setPublishing(true);

      await axios.patch("/api/courses/publish", {
        cid: actualCourse?.cid,
        publish: true,
      });

      toast.success("🚀 Course Published");

      // 🔥 Update React Query cache immediately (no waiting for refetch)
      queryClient.setQueryData(["courses"], (old = []) => {
        return old.map((item) => {
          const course = item?.courses || item;

          if (course?.cid === actualCourse?.cid) {
            return {
              ...item,
              courses: {
                ...item.courses,
                isPublished: true,
              },
            };
          }
          return item;
        });
      });

      // optional safety refetch
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    } catch (error) {
      toast.error("Failed to publish course");
    } finally {
      setPublishing(false);
    }
  };

  // =============================
  // DELETE FUNCTION
  // =============================
  const handleDeleteCourse = async () => {
    try {
      setDeleting(true);

      // Perform the delete first
      await axios.delete("/api/delete-course", {
        data: { courseId: actualCourse?.cid },
      });

      // Only update cache and show toast on success
      queryClient.setQueryData(["courses", "dashboard"], (old = []) =>
        old.filter((item) => {
          // Handle both flat and nested course structures
          if (item?.cid === actualCourse?.cid) {
            return false;
          }
          if (item?.courses?.cid === actualCourse?.cid) {
            return false;
          }
          return true;
        }),
      );

      toast.success("🗑 Course deleted");
      queryClient.invalidateQueries({ queryKey: ["courses", "dashboard"] });
    } catch (error) {
      toast.error("Failed to delete course");
      // No need to invalidate on error since we didn't update cache optimistically
    } finally {
      setDeleting(false);
    }
  };

  // =============================
  // ENROLL FUNCTION
  // =============================
  const onEnrollCourse = async () => {
    try {
      setEnrolling(true);

      await axios.post("/api/enroll-course", {
        courseId: actualCourse?.cid,
      });

      setLocalEnrolled(true);

      toast.success("🎉 Successfully Enrolled!");

      queryClient.invalidateQueries({ queryKey: ["enrolledCourses"] });
    } catch (e) {
      toast.error("Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="relative group shadow-lg rounded-xl bg-emerald-950 border border-emerald-700/30 max-w-xs">
      {/* ✅ Published Badge */}
      {isPublished && (
        <div className="absolute top-2 left-2 z-10 px-3 py-1 text-xs rounded-full bg-green-700 text-white flex items-center gap-1">
          Published
        </div>
      )}
      {showDelete && !isDeleted && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {/* EDIT */}
          <Link href={`/workspace/edit-course/${actualCourse?.cid}`}>
            <button className="p-2 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white">
              <PencilIcon size={14} />
            </button>
          </Link>

          {/* DELETE */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 rounded-full bg-red-500/80 hover:bg-red-600 text-white">
                <Trash2 size={14} />
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your course.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCourse}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      {/* PUBLISH BUTTON */}
      {showDelete && !isDeleted && !isPublished && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={handlePublishCourse}
            disabled={publishing}
            className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      )}
      {/* IMAGE */}
      <Image
        src={actualCourse?.bannerImgUrl || "/books.png"}
        alt={actualCourse?.name || "Course banner"}
        width={320}
        height={180}
        className="w-full h-32 object-cover rounded-t-xl"
      />
      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-emerald-100">
          {actualCourse?.name}
        </h2>

        <p className="line-clamp-3 text-emerald-300 text-sm">
          {actualCourse?.description || "No description available"}
        </p>

        <div className="flex justify-between items-center mt-2">
          <span className="flex items-center gap-1 text-emerald-400 text-sm">
            <Book size={16} /> {actualCourse?.noOfChapters || 0} Chapters
          </span>

          {/* ✅ BUTTON LOGIC */}
          {isDeleted ? (
            <span className="text-red-400 text-sm font-semibold">
              🚫 Unavailable
            </span>
          ) : actualCourse?.hasContent ? (
            enrolling ? (
              <Button disabled className="bg-gray-500 text-white">
                Enrolling...
              </Button>
            ) : localEnrolled ? (
              <Link href={`/course/${actualCourse?.cid}`}>
                <Button className="bg-green-600 text-white">
                  <PlaySquareIcon size={16} />
                  Resume
                </Button>
              </Link>
            ) : !isSignedIn ? (
              <Button disabled className="bg-gray-500 text-white">
                Login
              </Button>
            ) : (
              <Button onClick={onEnrollCourse}>Enroll</Button>
            )
          ) : (
            <Link href={`/workspace/edit-course/${actualCourse?.cid}`}>
              <Button size="sm" className="bg-emerald-700 text-white">
                <Plus /> Generate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
