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

import { useQueryClient } from "@tanstack/react-query";

/* =========================================
   DURATION PARSER
========================================= */

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

/* =========================================
   FRIENDLY FORMAT
========================================= */

function formatDurationFriendly(minutes) {
  if (!minutes) return "N/A";

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;

  return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
}

function CourseInfo({ course, viewCourse }) {
  const courseLayout = course?.courseJson?.course || {};

  const chapters = courseLayout?.chapters;

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const queryClient = useQueryClient();

  const hasContent = course?.hasContent;

  /* =========================================
     CONFIRM TOAST
  ========================================= */

  const showConfirmToast = () => {
    toast.custom(
      (t) => (
        <div
          className="
              max-w-sm
              w-full

              rounded-3xl

              bg-white
              dark:bg-gray-900

              border
              border-gray-200
              dark:border-gray-700

              shadow-2xl

              p-5
            "
        >
          <div className="mb-4">
            <p
              className="
                  font-bold

                  text-gray-900
                  dark:text-white

                  text-base
                "
            >
              Regenerate content?
            </p>

            <p
              className="
                  text-sm

                  text-gray-500
                  dark:text-gray-400

                  mt-2
                "
            >
              This will overwrite existing course content.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="
                  px-4
                  py-2

                  rounded-xl

                  bg-gray-100
                  dark:bg-gray-800

                  text-gray-700
                  dark:text-gray-300

                  hover:bg-gray-200
                  dark:hover:bg-gray-700

                  transition-all
                "
            >
              Cancel
            </button>

            <button
              onClick={() => {
                toast.dismiss(t.id);

                handleGenerate();
              }}
              className="
                  px-4
                  py-2

                  rounded-xl

                  bg-red-600
                  hover:bg-red-700

                  text-white

                  transition-all
                "
            >
              Continue
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      },
    );
  };

  /* =========================================
     GENERATE
  ========================================= */

const handleGenerate = async () => {
  setLoading(true);
  startLoading();

  try {
    const clientRequestId = uuid4();
    
    // Get includeVideo from course data or sessionStorage
    const includeVideoValue = course?.includeVideo || 
                             JSON.parse(sessionStorage.getItem("courseFormData") || "{}")?.includeVideo || 
                             false;

    console.log("🎬 Sending includeVideo to API:", includeVideoValue); // Debug log

    await axios.post("/api/generate-course-content", {
      courseJson: courseLayout,
      courseTitle: course?.name,
      courseId: course?.cid,
      clientRequestId,
      includeVideo: includeVideoValue  // ✅ Now it's included!
    });

    toast.success("Content Generated Successfully!");
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
      showConfirmToast();

      return;
    }

    handleGenerate();
  };

  /* =========================================
     TOTAL DURATION
  ========================================= */

  const totalMinutes =
    chapters?.reduce((sum, chapter) => {
      return sum + parseDurationToMinutes(chapter.duration);
    }, 0) || 0;

  /* =========================================
     MAIN
  ========================================= */

  return (
    <div
      className="
        flex
        flex-col-reverse
        lg:flex-row

        gap-8

        justify-between

        rounded-3xl

        border
        border-emerald-200
        dark:border-emerald-500/20

        bg-white/90
        dark:bg-gray-900/90

        backdrop-blur-xl

        shadow-2xl

        p-5
        lg:p-8

        overflow-hidden
      "
    >
      {/* LEFT */}
      <div
        className="
          flex-1

          flex
          flex-col

          gap-6
        "
      >
        {/* TITLE */}
        <div>
          <h2
            className="
              text-2xl
xl:text-3xl
              md:text-4xl

              font-black

              leading-tight

              text-emerald-900
              dark:text-emerald-300
            "
          >
            {courseLayout?.name || course?.name || "Untitled Course"}
          </h2>

          <p
            className="
              mt-4

              text-gray-600
              dark:text-gray-400

              leading-relaxed

              line-clamp-5
            "
          >
            {courseLayout?.description ||
              course?.description ||
              "No description available"}
          </p>
        </div>

        {/* STATS */}
<div
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    xl:grid-cols-3
    gap-2
    md:gap-3
  "
>
  {/* DURATION */}
  <div
    className="
      flex
      items-center
      gap-2
      md:gap-3
      rounded-xl
      border
      border-amber-200
      dark:border-amber-500/20
      bg-amber-50
      dark:bg-amber-500/10
      p-2
      md:p-3
    "
  >
    <div
      className="
        w-8
        h-8
        md:w-10
        md:h-10
        shrink-0
        rounded-lg
        md:rounded-xl
        flex
        items-center
        justify-center
        bg-white/70
        dark:bg-gray-900/60
      "
    >
      <Clock
        className="
          w-4
          h-4
          md:w-5
          md:h-5
          text-yellow-500
        "
      />
    </div>

    <div className="min-w-0">
      <p
        className="
          text-xs
          text-gray-500
          dark:text-gray-400
        "
      >
        Duration
      </p>

      <h2
        className="
          mt-0.5
          text-base
          md:text-lg
          font-bold
          leading-tight
          text-gray-900
          dark:text-white
          whitespace-nowrap
        "
      >
        {formatDurationFriendly(totalMinutes)}
      </h2>
    </div>
  </div>

  {/* CHAPTERS */}
  <div
    className="
      flex
      items-center
      gap-2
      md:gap-3
      rounded-xl
      border
      border-emerald-200
      dark:border-emerald-500/20
      bg-emerald-50
      dark:bg-emerald-500/10
      p-2
      md:p-3
    "
  >
    <div
      className="
        w-8
        h-8
        md:w-10
        md:h-10
        shrink-0
        rounded-lg
        md:rounded-xl
        flex
        items-center
        justify-center
        bg-white/70
        dark:bg-gray-900/60
      "
    >
      <Book
        className="
          w-4
          h-4
          md:w-5
          md:h-5
          text-emerald-600
        "
      />
    </div>

    <div className="min-w-0">
      <p
        className="
          text-xs
          text-gray-500
          dark:text-gray-400
        "
      >
        Chapters
      </p>

      <h2
        className="
          mt-0.5
          text-base
          md:text-lg
          font-bold
          leading-tight
          text-gray-900
          dark:text-white
          whitespace-nowrap
        "
      >
        {chapters?.length || 0}
      </h2>
    </div>
  </div>

  {/* DIFFICULTY */}
  <div
    className="
      flex
      items-center
      gap-2
      md:gap-3
      rounded-xl
      border
      border-rose-200
      dark:border-rose-500/20
      bg-rose-50
      dark:bg-rose-500/10
      p-2
      md:p-3
    "
  >
    <div
      className="
        w-8
        h-8
        md:w-10
        md:h-10
        shrink-0
        rounded-lg
        md:rounded-xl
        flex
        items-center
        justify-center
        bg-white/70
        dark:bg-gray-900/60
      "
    >
      <TrendingUpDownIcon
        className="
          w-4
          h-4
          md:w-5
          md:h-5
          text-rose-500
        "
      />
    </div>

    <div className="min-w-0">
      <p
        className="
          text-xs
          text-gray-500
          dark:text-gray-400
        "
      >
        Difficulty
      </p>

      <h2
        className="
          mt-0.5
          text-base
          md:text-lg
          font-bold
          leading-tight
          capitalize
          text-gray-900
          dark:text-white
          whitespace-nowrap
        "
      >
        {course?.level || "Beginner"}
      </h2>
    </div>
  </div>
</div>

        {/* BUTTON */}
        <div className="pt-2">
          {!viewCourse ? (
            <Button
              onClick={GenerateCourseContent}
              disabled={loading}
              className="
                w-full

                rounded-2xl

                py-6

                text-base
                font-semibold

                bg-emerald-600
                hover:bg-emerald-700

                shadow-lg
                hover:shadow-xl

                transition-all
              "
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin h-5 w-5" />
                  Generating, It may take a while...
                </>
              ) : (
                <>
                  <Settings2Icon className="mr-2 h-5 w-5" />

                  {hasContent ? "Regenerate Content" : "Generate Content"}
                </>
              )}
            </Button>
          ) : (
            <Link href={`/course/${course?.cid}`}>
              <Button
                className="
                  w-full

                  rounded-2xl

                  py-6

                  text-base
                  font-semibold

                  bg-emerald-600
                  hover:bg-emerald-700

                  shadow-lg
                  hover:shadow-xl

                  transition-all
                "
              >
                <PlaySquareIcon className="mr-2 h-5 w-5" />
                Resume Learning
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* IMAGE */}
      <div
        className="
          w-full
          lg:w-[360px]

          shrink-0
        "
      >
        <div
          className="
            relative

            overflow-hidden

            rounded-3xl

            shadow-xl
          "
        >
          <Image
            src={course?.bannerImgUrl || "/books.png"}
            alt="Banner"
            width={400}
            height={400}
            className="
              w-full

              h-64
              lg:h-full

              object-cover

              transition-transform
              duration-700

              hover:scale-105
            "
          />

          <div
            className="
              absolute
              inset-0

              bg-gradient-to-t
              from-black/20
              to-transparent
            "
          />
        </div>
      </div>
    </div>
  );
}

export default CourseInfo;
