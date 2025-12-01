import { Button } from "@/components/ui/button";
import axios from "axios";
import { Book, LoaderCircle, PlaySquareIcon, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import { startLoading, stopLoading } from "@/app/components/RouteLoader";
import { useEnrollContext } from "@/context/EnrollContext";

function CourseCard({ course }) {
  const courseJson = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);
  const { triggerRefresh } = useEnrollContext();

  const onEnrollCourse = async () => {
    try {
      setLoading(true);
      startLoading();
      
      const result = await axios.post('/api/enroll-course', {
        courseId: course?.cid
      }, {
        validateStatus: (status) => status < 500 // Accept 409 as valid response
      });
      
      console.log("Enrollment response:", result);
      
      // Simplified response handling
      const isAlreadyEnrolled = result.status === 409 || 
                                result.data?.response === "Already enrolled";
      
      if (isAlreadyEnrolled) {
        toast.warning("Already Enrolled to this course!");
      } else if (result.status === 200 || 
                 result.status === 201 || 
                 result.data?.success || 
                 result.data?.enrolledCourse) {
        toast.success('🎉 Successfully Enrolled!');
        
        // Optional: Show a message about where to find it
        setTimeout(() => {
          toast.info("Course added to 'Continue Learning' section!");
        }, 500);
      } else {
        // Handle other successful responses
        toast.success('🎉 Enrolled!');
      }
      
      // Always trigger refresh regardless of enrollment status
      triggerRefresh();
      
    } catch (e) {
      console.error("Enrollment error:", e);
      
      // Only handle network errors here, since 409 is handled in try block
      if (e.response?.status === 400) {
        toast.error("Bad request. Please try again.");
      } else if (e.response?.status === 401) {
        toast.error("Please login to enroll.");
      } else if (e.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    } finally {
      setLoading(false);
      stopLoading(); // Removed setTimeout
    }
  };

  return (
    <div
      className="
        group shadow-lg rounded-xl bg-emerald-950 
        border border-emerald-700/30
        max-w-xs
        transition-all transform hover:scale-[1.06] hover:shadow-emerald-700/80
        duration-150
      "
    >
      <Image
        src={course?.bannerImgUrl}
        alt={course?.name}
        width={320}
        height={180}
        className="w-full h-32 object-cover rounded-t-xl"
      />
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-emerald-100 leading-tight">
          {courseJson?.name}
        </h2>
        <p className="line-clamp-3 text-emerald-300 text-sm">
          {courseJson?.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="flex items-center gap-1 text-emerald-400 text-sm">
            <Book size={16} /> {courseJson?.noOfChapters}{" "}
            {courseJson?.noOfChapters > 1 ? "Chapters" : "Chapter"}
          </span>
          {course?.courseContent?.length ? (
            <Button
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-1 rounded-md text-sm flex items-center gap-2 shadow"
              onClick={onEnrollCourse}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin" size={16} /> 
                  <span className="ml-1">Enrolling...</span>
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
                className="
                  bg-emerald-700 hover:bg-emerald-600
                  text-white
                  border-0
                  flex items-center gap-2
                "
              >
                <Plus /> Generate Course
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;