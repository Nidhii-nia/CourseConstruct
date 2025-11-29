"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Book, Clock, Loader2, PlaySquareIcon, Settings2Icon, TrendingUpDownIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

// === Friendly Duration Formatter (generalized) ===
function formatDurationFriendly(raw) {
  if (!raw) return "N/A";
  let str = String(raw).toLowerCase().trim();

  // Numbers: treat as minutes
  if (/^\d+$/.test(str)) {
    const min = parseInt(str, 10);
    if (min < 60) return `${min} min`;
    const hrs = Math.floor(min / 60);
    const rem = min % 60;
    return rem ? `${hrs} hr${hrs > 1 ? "s" : ""} ${rem} min` : `${hrs} hr${hrs > 1 ? "s" : ""}`;
  }
  // 'minute(s)', 'min(s)'
  if (/(\d+)\s*(minute|min|minutes|mins)/.test(str)) {
    const match = str.match(/(\d+)\s*(minute|min|minutes|mins)/);
    const min = parseInt(match[1], 10);
    if (min < 60) return `${min} min`;
    const hrs = Math.floor(min / 60);
    const rem = min % 60;
    return rem ? `${hrs} hr${hrs > 1 ? "s" : ""} ${rem} min` : `${hrs} hr${hrs > 1 ? "s" : ""}`;
  }
  // 'hour(s)', 'hr(s)'
  if (/(\d+)\s*(hour|hr|hours|hrs)/.test(str)) {
    const match = str.match(/(\d+(\.\d+)?)\s*(hour|hr|hours|hrs)/);
    const hrs = parseFloat(match[1]);
    if (hrs === 1) return "1 hr";
    return `${hrs} hrs`;
  }
  // HH:MM or HH:MM:SS formats
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const parts = str.split(":").map(Number);
    const hrs = parts[0];
    const min = parts[1] || 0;
    if (hrs && min) return `${hrs} hr${hrs > 1 ? "s" : ""} ${min} min`;
    if (hrs) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
    return `${min} min`;
  }
  return raw;
}

function CourseInfo({ course,viewCourse }) {
  const courseLayout = course?.courseJson?.course;
  const chapters = courseLayout?.chapters;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const GenerateCourseContent = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/generate-course-content", {
        courseJson: courseLayout,
        courseTitle: course?.name,
        courseId: course?.cid,
      });
      setLoading(false);
      router.replace('/workspace');
      toast.success("🎉 Content Generated Successfully!");
    } catch (e) {
      setLoading(false);
      toast.error("Server side error! Please try again.");
    }
  };

  // Calculate total duration in minutes (parse all possible formats)
  const totalMinutes = chapters?.reduce((sum, chapter) => {
    let dur = chapter.duration;
    if (!dur) return sum;
    dur = String(dur).toLowerCase().trim();
    if (/^\d+$/.test(dur)) return sum + parseInt(dur, 10);
    if (/(\d+)\s*(minute|min|minutes|mins)/.test(dur)) {
      const match = dur.match(/(\d+)\s*(minute|min|minutes|mins)/);
      return sum + parseInt(match[1]);
    }
    if (/(\d+)\s*(hour|hr|hours|hrs)/.test(dur)) {
      const match = dur.match(/(\d+(\.\d+)?)\s*(hour|hr|hours|hrs)/);
      return sum + Math.round(parseFloat(match[1]) * 60);
    }
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(dur)) {
      const splits = dur.split(":");
      return sum + (parseInt(splits[0]) * 60 + parseInt(splits[1]));
    }
    // fallback: ignore this chapter's duration
    return sum;
  }, 0);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-5 justify-between shadow-2xl border border-amber-950 rounded-2xl p-4">
      <div className="flex flex-col gap-5">
        <h2 className="font-bold text-2xl">{courseLayout?.name}</h2>
        <p className="line-clamp-2 text-gray-500">{courseLayout?.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="flex gap-5 items-center p-3 m-0.5 rounded-b-lg border border-amber-900">
            <Clock className="text-yellow-500" />
            <section>
              <h2 className="font-bold">Duration</h2>
              <h2>{formatDurationFriendly(totalMinutes)}</h2>
            </section>
          </div>
          <div className="flex gap-5 items-center p-3 m-0.5 rounded-b-lg border border-amber-900">
            <Book className="text-green-500" />
            <section>
              <h2 className="font-bold">Chapters</h2>
              <h2>{course?.noOfChapters}</h2>
            </section>
          </div>
          <div className="flex gap-5 items-center p-3 m-0.5 rounded-b-lg border border-amber-900">
            <TrendingUpDownIcon className="text-red-500" />
            <section>
              <h2 className="font-bold">Difficulty</h2>
              <h2>{course?.level}</h2>
            </section>
          </div>
        </div>
{! viewCourse ?         <Button onClick={GenerateCourseContent} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Settings2Icon className="w-4 h-4 mr-2" /> Generate Content
            </>
          )}
        </Button> : <Link href={`/course/${course?.cid}`}><Button>
          <PlaySquareIcon /> Resume Learning
          </Button></Link>}
      </div>
      <Image
        src={course?.bannerImgUrl}
        alt={"Banner Image"}
        width={400}
        height={400}
        className="w-full h-60 rounded-2xl p-2 object-cover aspect-auto"
      />
    </div>
  );
}

export default CourseInfo;
