"use client";

import { v4 as uuid4 } from "uuid";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Book, Clock, Loader2, PlaySquareIcon, Settings2Icon, TrendingUpDownIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { startLoading, stopLoading } from "@/app/components/RouteLoader";

// === Duration Parser ===
function parseDurationToMinutes(duration) {
  if (!duration) return 0;
  const str = String(duration).toLowerCase().trim();
  
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  if (str.includes("min")) return parseInt(str.match(/\d+/)?.[0] || 0);
  if (str.includes("hour") || str.includes("hr")) 
    return Math.round(parseFloat(str.match(/\d+(\.\d+)?/)?.[0] || 0) * 60);
  if (str.includes(":")) {
    const [hours, minutes] = str.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }
  return 0;
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
      router.replace('/workspace');
    } catch (e) {
      console.error("Generate content error:", e);
      toast.error("Server side error! Please try again.");
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const totalMinutes = chapters?.reduce((sum, chapter) => {
    return sum + parseDurationToMinutes(chapter.duration);
  }, 0) || 0;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-5 justify-between shadow-2xl border border-amber-950 rounded-2xl p-4">
      <div className="flex flex-col gap-5">
        <h2 className="font-bold text-2xl">{courseLayout?.name || course?.name || "Untitled Course"}</h2>
        <p className="line-clamp-2 text-gray-500">{courseLayout?.description || course?.description || "No description available"}</p>
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
              <h2>{course?.noOfChapters || 0}</h2>
            </section>
          </div>
          <div className="flex gap-5 items-center p-3 m-0.5 rounded-b-lg border border-amber-900">
            <TrendingUpDownIcon className="text-red-500" />
            <section>
              <h2 className="font-bold">Difficulty</h2>
              <h2>{course?.level || "Beginner"}</h2>
            </section>
          </div>
        </div>
        {!viewCourse ? (
          <Button onClick={GenerateCourseContent} disabled={loading} className="relative">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </>
            ) : (
              <>
                <Settings2Icon className="w-4 h-4 mr-2" /> Generate Content
              </>
            )}
          </Button>
        ) : (
          <Link href={`/course/${course?.cid}`}>
            <Button className="bg-primary hover:from-green-700 hover:to-emerald-700">
              <PlaySquareIcon className="mr-2" /> Resume Learning
            </Button>
          </Link>
        )}
      </div>
      <Image
        src={course?.bannerImgUrl || "/books.png"}
        alt={"Banner Image"}
        width={400}
        height={400}
        className="w-full h-60 rounded-2xl p-2 object-cover aspect-auto shadow-lg"
      />
    </div>
  );
}

export default CourseInfo;