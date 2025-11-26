import { Gift, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

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

  const toggleChapter = (index) => {
    setOpenChapter(openChapter === index ? null : index);
  };

  return (
    <div className="max-w-full mt-10">
      <h2 className="font-extrabold text-3xl mb-7 text-slate-800 tracking-tight">
        Chapters & Topics
      </h2>
      <div className="flex flex-col gap-6">
        {courseLayout?.chapters.map((chapter, idx) => (
          <div
            key={idx}
            className="border border-emerald-950 rounded-2xl shadow-md overflow-hidden"
          >
            <button
              className="w-full flex flex-col items-start p-3  text-emerald-950 font-semibold hover:bg-emerald-300 transition-colors"
              onClick={() => toggleChapter(idx)}
            >
              <h2 className="text-xl font-bold mb-2 text-left">
                Chapter {idx + 1}:
                <span className="font-bold ml-2">{chapter.chapterName}</span>
              </h2>
              <div className="flex gap-6 text-l text-emerald-800 font-medium mb-1 text-left">
                <span>
                  Duration: <span className="font-normal">{formatDurationFriendly(chapter.duration)}</span>
                </span>
                <span>
                  Topics: <span className="font-normal">{chapter.topics?.length}</span>
                </span>
              </div>
              <span className="self-end">
                {openChapter === idx ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
              </span>
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
                {chapter.topics?.map((topic, topicIdx) => (
                  <li
                    key={topicIdx}
                    className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border shadow-sm hover:bg-slate-100 transition"
                  >
                    <div className="text-emerald-600 bg-emerald-100 font-bold rounded-full w-8 h-8 flex items-center justify-center text-base">
                      {topicIdx + 1}
                    </div>
                    <div className="flex-1 text-slate-800 font-semibold">{topic}</div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center mt-6">
                <Gift className="text-emerald-500 w-10 h-10 p-2 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        ))}
        <div className="mx-auto mt-4 py-2 px-16 rounded-full bg-emerald-950 text-white text-lg font-bold shadow">
          Finish
        </div>
      </div>
    </div>
  );
}

export default ChapterTopicList;
