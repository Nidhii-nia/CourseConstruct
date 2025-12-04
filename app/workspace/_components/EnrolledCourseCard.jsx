import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlaySquareIcon } from "lucide-react";

function EnrolledCourseCard({ course, enrolledCourse }) {
  const courseJson = course?.courseJson?.course;

  const calculatePerProgress = () => {
    const completed = enrolledCourse?.completedChapters?.length || 0;
    const total = course?.courseContent?.length || 0;
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  const progress = calculatePerProgress();

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
        src={course?.bannerImgUrl || '/books.png'}
        alt={course?.name || "Course Banner"}
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

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-emerald-200 font-semibold">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <Progress value={progress} className="h-2 bg-emerald-900" />

          <Link href={`/workspace/view-course/${course?.cid}`}>
            <Button className="w-full mt-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-1 rounded-md text-sm flex items-center gap-2 shadow">
              <PlaySquareIcon className="mr-2 h-4 w-4" />
              Resume Learning
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EnrolledCourseCard;
