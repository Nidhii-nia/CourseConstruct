"use client";

import { v4 as uuid4 } from "uuid";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Book, Clock, Loader2, PlaySquareIcon, Settings2Icon, TrendingUpDownIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { startLoading, stopLoading } from "@/app/components/RouteLoader";

// === Duration Parser (returns minutes) ===
function parseDurationToMinutes(duration) {
  if (!duration) return 0;
  
  let str = String(duration).toLowerCase().trim();
  
  // Numbers: treat as minutes
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }
  
  // 'minute(s)', 'min(s)'
  if (/(\d+)\s*(minute|min|minutes|mins)/.test(str)) {
    const match = str.match(/(\d+)\s*(minute|min|minutes|mins)/);
    return parseInt(match[1], 10);
  }
  
  // 'hour(s)', 'hr(s)'
  if (/(\d+)\s*(hour|hr|hours|hrs)/.test(str)) {
    const match = str.match(/(\d+(\.\d+)?)\s*(hour|hr|hours|hrs)/);
    return Math.round(parseFloat(match[1]) * 60);
  }
  
  // HH:MM or HH:MM:SS formats
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const parts = str.split(":").map(Number);
    const hrs = parts[0] || 0;
    const min = parts[1] || 0;
    return hrs * 60 + min;
  }
  
  return 0;
}

// === Friendly Duration Formatter ===
function formatDurationFriendly(minutes) {
  if (!minutes) return "N/A";
  
  if (minutes < 60) return `${minutes} min`;
  
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  
  if (rem === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${hrs} hr${hrs > 1 ? "s" : ""} ${rem} min`;
}

function CourseInfo({ course, viewCourse }) {
  const courseLayout = course?.courseJson?.course;
  const chapters = courseLayout?.chapters;
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();
  const isMountedRef = useRef(true);

  // Show loading while course data is being fetched - NO DELAY
  useEffect(() => {
    isMountedRef.current = true;
    
    if (course) {
      setIsLoadingData(false);
    } else {
      setIsLoadingData(true);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [course]);

  const GenerateCourseContent = async () => {
    // Prevent multiple clicks
    if (loading) return;
    
    setLoading(true);
    startLoading();
    
    try {
      const clientRequestId = uuid4();

      const result = await axios.post("/api/generate-course-content", {
        courseJson: courseLayout,
        courseTitle: course?.name,
        courseId: course?.cid,
        clientRequestId,
      });

      toast.success("🎉 Content Generated Successfully!");
      
      // Only navigate if component is still mounted
      if (isMountedRef.current) {
        router.replace('/workspace');
      }
    } catch (e) {
      console.error("Generate content error:", e);
      toast.error("Server side error! Please try again.");
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
      stopLoading(); // Direct call without delay
    }
  };

  // Calculate total duration in minutes using parser
  const totalMinutes = chapters?.reduce((sum, chapter) => {
    return sum + parseDurationToMinutes(chapter.duration);
  }, 0) || 0;

  // Show loading spinner while course data is loading
  if (isLoadingData || !course) {
    return (
      <div className="shadow-2xl border border-amber-950 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center min-h-[300px]">
          <div className="text-center lg:text-left">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-amber-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Book className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-amber-800 mb-3">Loading Course Information</h3>
            <p className="text-amber-600">Fetching course details...</p>
          </div>
          <div className="w-48 h-48 bg-linear-to-br from-amber-100 to-yellow-100 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

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
            <Button className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <PlaySquareIcon className="mr-2" /> Resume Learning
            </Button>
          </Link>
        )}
      </div>
      <Image
        src={course?.bannerImgUrl}
        alt={"Banner Image"}
        width={400}
        height={400}
        className="w-full h-60 rounded-2xl p-2 object-cover aspect-auto shadow-lg"
      />
    </div>
  );
}

export default CourseInfo;