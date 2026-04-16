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
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { startLoading, stopLoading } from "@/app/components/RouteLoaderInner";
import { useQueryClient } from "@tanstack/react-query";
import { size } from "lodash";

// === Duration Parser ===
function parseDurationToMinutes(duration) {
  if (!duration) return 0;

  if (typeof duration === "number") return duration;

  const str = String(duration).toLowerCase().trim();
  let total = 0;

  const hourMatch = str.match(/(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  if (hourMatch) total += Math.round(parseFloat(hourMatch[1]) * 60);

  const minMatch = str.match(/(\d+)\s*(m|min|mins|minute|minutes)/);
  if (minMatch) total += parseInt(minMatch[1], 10);

  if (str.includes(":")) {
    const [h, m] = str.split(":").map(Number);
    if (!isNaN(h)) total += h * 60;
    if (!isNaN(m)) total += m;
  }

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
  const queryClient = useQueryClient();

const hasContent = course?.hasContent;


const showConfirmToast = () => {
  toast.custom(
    (t) => (
      <div className="max-w-sm w-full bg-white rounded-xl shadow-lg border p-4">
        
        {/* Text */}
        <div className="mb-3">
          <p className="font-semibold text-gray-900 text-sm">
            Regenerate content?
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This will overwrite existing course content.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleGenerate();
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
          >
            Continue
          </button>
        </div>
      </div>
    ),
    { duration: Infinity }
  );
};

const handleGenerate = async () => {
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

    queryClient.invalidateQueries(["courses", "dashboard"]);

    router.replace("/workspace");
  } catch (e) {
    console.error("Generate course error:", e);
    toast.error("Server side error! Please try again.");
  } finally {
    setLoading(false);
    stopLoading();
  }
};

const GenerateCourseContent = () => {
  if (loading) return;

  if (hasContent) {
    showConfirmToast(); // 👈 show UI
    return;
  }

  handleGenerate(); // 👈 direct call
};

  // ✅ total duration (ONLY from DB data)
  const totalMinutes =
    chapters?.reduce((sum, chapter) => {
      return sum + parseDurationToMinutes(chapter.duration);
    }, 0) || 0;

  return (
    <div className="flex flex-col-reverse lg:flex-row flex-wrap gap-6 lg:gap-8 justify-between shadow-2xl border border-amber-950 rounded-2xl p-4 lg:p-6 overflow-x-hidden">
      
      {/* LEFT */}
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h2 className="font-bold text-3xl">
            {courseLayout?.name || course?.name || "Untitled Course"}
          </h2>
          <p className="text-gray-500 mt-3 line-clamp-6">
            {courseLayout?.description ||
              course?.description ||
              "No description available"}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="flex gap-4 items-center p-4 rounded-lg border bg-amber-50/30 w-35 m-1">
            <Clock className="text-yellow-500 w-12 h-12" />
            <div>
              <h2 className="text-xs text-gray-600">Duration</h2>
              <h2 className="font-semibold">
                {formatDurationFriendly(totalMinutes)}
              </h2>
            </div>
          </div>

          <div className="flex gap-4 items-center p-4 rounded-lg border bg-amber-50/30 w-35 m-1">
            <Book className="text-green-500 w-12 h-12" />
            <div>
              <h2 className="text-xs text-gray-600">Chapters</h2>
              <h2 className="font-semibold">
                {chapters?.length || 0}
              </h2>
            </div>
          </div>

          <div className="flex gap-4 items-center p-4 rounded-lg border bg-amber-50/30 w-40 m-1">
            <TrendingUpDownIcon className="text-red-500 w-12 h-12" />
            <div>
              <h2 className="text-xs text-gray-600">Difficulty</h2>
              <h2 className="font-semibold">
                {course?.level || "Beginner"}
              </h2>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-4">
          {!viewCourse ? (
            <Button
              onClick={GenerateCourseContent}
              disabled={loading}
              className="w-full py-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Settings2Icon className="mr-2" />
                  {hasContent ? "Regenerate Content" : "Generate Content"}
                </>
              )}
            </Button>
          ) : (
            <Link href={`/course/${course?.cid}`}>
              <Button className="w-full py-4">
                <PlaySquareIcon className="mr-2" />
                Resume Learning
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="w-full lg:max-w-sm">
        <Image
          src={course?.bannerImgUrl || "/books.png"}
          alt="Banner"
          width={400}
          height={400}
          className="w-full h-64 rounded-2xl object-cover"
        />
      </div>
    </div>
  );
}

export default CourseInfo;