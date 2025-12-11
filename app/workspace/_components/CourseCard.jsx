"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Book, LoaderCircle, PlaySquareIcon, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import { startLoading, stopLoading } from "@/app/components/RouteLoader";
import { useEnrollContext } from "@/context/EnrollContext";
import { useUser } from "@clerk/nextjs";

function CourseCard({ course }) {
  const courseJson = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);
  const { triggerRefresh } = useEnrollContext();
  const { isSignedIn } = useUser();

  const onEnrollCourse = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to enroll in courses");
      return;
    }

    try {
      setLoading(true);
      startLoading();

      const result = await axios.post("/api/enroll-course", {
        courseId: course?.cid,
      });

      if (result.status === 409) {
        toast.warning("Already enrolled!");
      } else {
        toast.success("🎉 Successfully Enrolled!");

        // SIMPLE: Just refresh once
        triggerRefresh();
      }
    } catch (e) {
      if (e.response?.status === 409) {
        toast.warning("Already enrolled!");
      } else {
        toast.error("Failed to enroll");
      }
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  return (
    <div className="group shadow-lg rounded-xl bg-emerald-950 border border-emerald-700/30 max-w-xs transition-all transform hover:scale-[1.02] hover:shadow-emerald-700/80 duration-150">
      <Image
        src={course?.bannerImgUrl || "/books.png"}
        alt={course?.name}
        width={320}
        height={180}
        className="w-full h-32 object-cover rounded-t-xl"
      />
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-emerald-100 leading-tight">
          {courseJson?.name || course?.name}
        </h2>
        <p className="line-clamp-3 text-emerald-300 text-sm">
          {courseJson?.description || course?.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="flex items-center gap-1 text-emerald-400 text-sm">
            <Book size={16} /> {course?.noOfChapters || 0}{" "}
            {course?.noOfChapters > 1 ? "Chapters" : "Chapter"}
          </span>
          {course?.hasContent ? (
            <Button
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-1 rounded-md text-sm flex items-center gap-2"
              onClick={onEnrollCourse}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin" size={16} />
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <PlaySquareIcon size={16} /> Enroll
                </>
              )}
            </Button>
          ) : (
            <Link href={`/workspace/edit-course/${course?.cid}`}>
              <Button
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-600 text-white border-0"
              >
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
