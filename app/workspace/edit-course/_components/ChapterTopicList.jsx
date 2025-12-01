"use client";

import { Gift, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";

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

function ChapterTopicList({ course }) {
  const courseLayout = course?.courseJson?.course;
  const [openChapter, setOpenChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add loading state when course data is not available
  useEffect(() => {
    if (courseLayout) {
      // Simulate loading for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [courseLayout]);

  const toggleChapter = (index) => {
    setOpenChapter(openChapter === index ? null : index);
  };

  // Show loading spinner while data is loading
  if (isLoading || !courseLayout) {
    return (
      <div className="max-w-full mt-10">
        <h2 className="font-extrabold text-3xl mb-7 text-slate-800 tracking-tight">
          Chapters & Topics
        </h2>
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-emerald-100 rounded-2xl bg-linear-to-br from-emerald-50/50 to-white">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Gift className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">
              Loading Course Structure
            </h3>
            <p className="text-emerald-600 text-sm">
              Preparing chapters and topics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no chapters
  if (!courseLayout?.chapters?.length) {
    return (
      <div className="max-w-full mt-10">
        <h2 className="font-extrabold text-3xl mb-7 text-slate-800 tracking-tight">
          Chapters & Topics
        </h2>
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-emerald-100 rounded-2xl bg-linear-to-br from-emerald-50/50 to-white p-8">
          <Gift className="w-16 h-16 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">
            No Chapters Yet
          </h3>
          <p className="text-emerald-600 text-center max-w-md">
            This course doesn't have any chapters yet. 
            Click "Generate Content" to create chapters and topics for this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mt-10">
      <h2 className="font-extrabold text-3xl mb-7 text-slate-800 tracking-tight">
        Chapters & Topics ({courseLayout.chapters.length})
      </h2>
      <div className="flex flex-col gap-6">
        {courseLayout.chapters.map((chapter, idx) => (
          <div
            key={idx}
            className="border border-emerald-950 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <button
              className="w-full flex flex-col items-start p-5 text-emerald-950 font-semibold hover:bg-emerald-50 transition-colors"
              onClick={() => toggleChapter(idx)}
            >
              <div className="flex justify-between items-center w-full">
                <div className="text-left">
                  <h2 className="text-xl font-bold mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 mr-3">
                      {idx + 1}
                    </span>
                    {chapter.chapterName}
                  </h2>
                  <div className="flex gap-6 text-l text-emerald-800 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="font-normal">{formatDurationFriendly(chapter.duration)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-normal">{chapter.topics?.length || 0} topics</span>
                    </span>
                  </div>
                </div>
                <span className="text-emerald-600">
                  {openChapter === idx ? (
                    <ChevronUp size={24} />
                  ) : (
                    <ChevronDown size={24} />
                  )}
                </span>
              </div>
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${
                openChapter === idx
                  ? "max-h-[600px] p-5 border-t border-emerald-100 overflow-y-auto"
                  : "max-h-0 p-0"
              } bg-slate-50`}
              style={{ minHeight: openChapter === idx ? "100px" : undefined }}
            >
              <ul className="flex flex-col gap-3 mt-1">
                {chapter.topics?.length > 0 ? (
                  chapter.topics.map((topic, topicIdx) => (
                    <li
                      key={topicIdx}
                      className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border shadow-sm hover:bg-emerald-50 transition-all hover:translate-x-1"
                    >
                      <div className="text-emerald-600 bg-emerald-100 font-bold rounded-full w-8 h-8 flex items-center justify-center text-base">
                        {topicIdx + 1}
                      </div>
                      <div className="flex-1 text-slate-800 font-semibold">{topic}</div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-4 text-emerald-600 italic">
                    No topics defined for this chapter
                  </li>
                )}
              </ul>
              <div className="flex justify-center mt-6">
                <Gift className="text-emerald-500 w-10 h-10 p-2 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        ))}
        <div className="mx-auto mt-4 py-3 px-20 rounded-full bg-emerald-950 text-white text-lg font-bold shadow-lg hover:bg-emerald-900 transition-colors cursor-default">
          Finish
        </div>
      </div>
    </div>
  );
}

export default ChapterTopicList;