"use client";

import { v4 as uuid4 } from "uuid";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Book,
  Clock,
  Loader2,
  PlaySquareIcon,
  Settings2Icon,
  TrendingUpDownIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { startLoading, stopLoading } from "@/app/components/RouteLoaderInner";

// === Duration Parser ===
function parseDurationToMinutes(duration) {
  if (!duration) return 0;

  // If already a number (minutes)
  if (typeof duration === "number") return duration;

  const str = String(duration).toLowerCase().trim();

  let total = 0;

  // hours (hr, hrs, hour, hours, h)
  const hourMatch = str.match(/(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  if (hourMatch) {
    total += Math.round(parseFloat(hourMatch[1]) * 60);
  }

  // minutes (min, mins, minute, minutes, m)
  const minMatch = str.match(/(\d+)\s*(m|min|mins|minute|minutes)/);
  if (minMatch) {
    total += parseInt(minMatch[1], 10);
  }

  // HH:MM format
  if (str.includes(":")) {
    const [h, m] = str.split(":").map(Number);
    if (!isNaN(h)) total += h * 60;
    if (!isNaN(m)) total += m;
  }

  // plain number string fallback
  if (total === 0 && /^\d+$/.test(str)) {
    total = parseInt(str, 10);
  }

  return total;
}


// === Friendly Duration Formatter ===
function formatDurationFriendly(minutes) {
  if (!minutes) return "N/A";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
}

function CourseInfo({ course, viewCourse }) {
  const courseLayout = course?.courseJson?.course;
  const chapters = courseLayout?.chapters;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const GenerateCourseContent = async () => {
    if (loading) return;

    setLoading(true);
    startLoading();

    try {
      const clientRequestId = uuid4();
      await axios.post("/api/generate-course-content", {
        courseJson: courseLayout,
        courseTitle: course?.name,
        courseId: course?.cid,
        clientRequestId,
      });

      toast.success("🎉 Content Generated Successfully!");
      router.replace("/workspace");
    } catch (e) {
      console.error("Generate content error:", e);
      toast.error("Server side error! Please try again.");
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const totalMinutes =
    chapters?.reduce((sum, chapter) => {
      return sum + parseDurationToMinutes(chapter.duration);
    }, 0) || 0;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-8 justify-between shadow-2xl border border-amber-950 rounded-2xl p-4 lg:p-6">
      {/* Left Content - Takes more space on large screens */}
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h2 className="font-bold text-2xl lg:text-3xl">
            {courseLayout?.name || course?.name || "Untitled Course"}
          </h2>
          <p className="line-clamp-2 lg:line-clamp-3 text-gray-500 mt-2 lg:mt-3 text-sm lg:text-base">
            {courseLayout?.description ||
              course?.description ||
              "No description available"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          <div className="flex gap-3 lg:gap-4 items-center p-3 lg:p-4 rounded-lg border border-amber-900 bg-amber-50/30">
            <Clock className="text-yellow-500 w-5 h-5 lg:w-5 lg:h-5 shrink-0" />
            <section className="min-w-0">
              <h2 className="font-bold text-xs lg:text-xs text-gray-600">
                Duration
              </h2>
              <h2 className="text-sm lg:text-sm font-semibold text-gray-800 truncate">
                {formatDurationFriendly(totalMinutes)}
              </h2>
            </section>
          </div>
          <div className="flex gap-3 lg:gap-4 items-center p-3 lg:p-4 rounded-lg border border-amber-900 bg-amber-50/30">
            <Book className="text-green-500 w-5 h-5 lg:w-5 lg:h-5 shrink-0" />
            <section className="min-w-0">
              <h2 className="font-bold text-xs lg:text-xs text-gray-600">
                Chapters
              </h2>
              <h2 className="text-sm lg:text-sm font-semibold text-gray-800">
                {chapters?.length || course?.noOfChapters || 0}
              </h2>
            </section>
          </div>
          <div className="flex gap-3 lg:gap-4 items-center p-3 lg:p-4 rounded-lg border border-amber-900 bg-amber-50/30">
            <TrendingUpDownIcon className="text-red-500 w-5 h-5 lg:w-5 lg:h-5 shrink-0" />
            <section className="min-w-0">
              <h2 className="font-bold text-xs lg:text-xs text-gray-600">
                Difficulty
              </h2>
              <h2 className="text-sm lg:text-sm font-semibold text-gray-800 truncate">
                {course?.level || "Beginner"}
              </h2>
            </section>
          </div>
        </div>

        <div className="mt-2 lg:mt-4">
          {!viewCourse ? (
            <Button
              onClick={GenerateCourseContent}
              disabled={loading}
              className="relative w-full lg:w-full px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 animate-spin" />
                  Generating...
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </>
              ) : (
                <>
                  <Settings2Icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          ) : (
            <Link href={`/course/${course?.cid}`}>
              <Button className="w-full lg:w-auto px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base bg-primary hover:from-green-700 hover:to-emerald-700">
                <PlaySquareIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Resume Learning
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Right Image - Fixed width on large screens */}
      <div className="lg:w-96 xl:w-[420px] shrink-0">
        <Image
          src={course?.bannerImgUrl || "/books.png"}
          alt={"Banner Image"}
          width={400}
          height={400}
          className="w-full h-60 lg:h-64 xl:h-72 rounded-2xl object-cover shadow-lg lg:shadow-xl"
        />
      </div>
    </div>
  );
}

export default CourseInfo;
