"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlaySquareIcon, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

function EnrolledCourseCard({ course, enrolledCourse, onUnenroll }) {
  const isUnavailable = course?.isDeleted;

  const [isUnenrolling, setIsUnenrolling] = useState(false);

  const calculatePerProgress = () => {
    const completed = enrolledCourse?.completedChapters?.length || 0;
    const total = course?.noOfChapters || 0;

    if (!total) return 0;

    return Math.min(100, Math.round((completed / total) * 100));
  };

  const progress = calculatePerProgress();

  // Handle Unenroll
const handleUnenroll = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (isUnenrolling) return;

  setIsUnenrolling(true);

  try {
    await onUnenroll?.(course?.cid);
  } catch (err) {
    console.error(err);
    toast.error("Failed to unenroll. Try again.");
  } finally {
    setIsUnenrolling(false);
  }
};

  return (
    <div className="relative group">
     {!isUnavailable && (
  <button
    onClick={handleUnenroll}
    disabled={isUnenrolling}
    className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full transition disabled:opacity-50 text-xs"
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

      <div
        className={`
          shadow-lg rounded-xl bg-emerald-950 
          border border-emerald-700/30
          max-w-xs
          transition-all transform hover:scale-[1.06] hover:shadow-emerald-700/80
          duration-150
          ${isUnavailable ? "blur-sm pointer-events-none" : ""}
        `}
      >
        <Image
          src={course?.bannerImgUrl || "/books.png"}
          alt={course?.name || "Course Banner"}
          width={320}
          height={180}
          className="w-full h-32 object-cover rounded-t-xl"
        />

        <div className="p-4 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-emerald-100 leading-tight">
            {course?.name}
          </h2>

          <p className="line-clamp-3 text-emerald-300 text-sm">
            {course?.courseJson?.course?.description}
          </p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-emerald-200 font-semibold">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <Progress value={progress} className="h-2 bg-emerald-900" />

            {isUnenrolling ? (
              <Button
                disabled={true}
                className="w-full mt-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-1 rounded-md text-sm flex items-center gap-2 shadow opacity-60"
              >
                <PlaySquareIcon className="mr-2 h-4 w-4" />
                Resume Learning
              </Button>
            ) : (
              <Link href={`/course/${course?.cid}`}>
                <Button className="w-full mt-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-1 rounded-md text-sm flex items-center gap-2 shadow">
                  <PlaySquareIcon className="mr-2 h-4 w-4" />
                  Resume Learning
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10">
          <div className="text-center px-4">
            <h2 className="text-white text-lg font-semibold">
              Course Unavailable
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              This course is not available right now
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnrolledCourseCard;