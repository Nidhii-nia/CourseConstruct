"use client";
import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import { useSidebar } from "@/context/SidebarContext";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Clock,
  BookOpen,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { Download } from "lucide-react";
import FeedbackDialog from "./FeedbackDialogue";

export default function ChapterListSidebar({ courseInfo, topicRefs }) {
  const { user } = useUser();
  const [startingQuiz, setStartingQuiz] = useState(false);
  const courseContent = useMemo(
    () => courseInfo?.courses?.courseContent,
    [courseInfo],
  );

  const { selectedChapterIndex, setSelectedChapterIndex } = useContext(
    SelectedChapterIndexContext,
  );
  const [showFeedback, setShowFeedback] = useState(false);

  const { enrollCourse } = courseInfo ?? {};
  const completedChapters = useMemo(
    () => enrollCourse?.completedChapters ?? [],
    [enrollCourse],
  );

  const totalChapters = courseContent?.length || 0;
  const completedCount = completedChapters.length;

  const isCourseCompleted =
    totalChapters > 0 && completedCount === totalChapters;

  const cid = courseInfo?.cid || courseInfo?.courses?.cid;

    console.log({
    totalChapters,
    completedCount,
    isCourseCompleted,
    cid,
  });

useEffect(() => {
  if (!courseContent || courseContent.length === 0) return;

  if (isCourseCompleted && cid) {
    setShowFeedback(true);
  }
}, [isCourseCompleted, cid, courseContent]);

  // Use the sidebar context
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Auto-collapse on mobile
    if (isMobile) {
      setIsCollapsed(true);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile, setIsCollapsed]);

  const handleTopicClick = (index) => {
    if (topicRefs?.current?.[index]) {
      topicRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Calculate chapter progress percentage
  const calculateChapterProgress = (chapterIndex) => {
    const chapter = courseContent?.[chapterIndex];
    const totalTopics = chapter?.courseData?.topics?.length || 0;
    const completedTopics =
      enrollCourse?.completedTopics?.[chapterIndex]?.length || 0;
    return totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;
  };

  const handleExportPDF = () => {
    const content = document.getElementById("full-course-pdf");

    if (!content) {
      alert("Content not found");
      return;
    }

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>Course PDF</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #000;
            background: #fff;
          }
          h1, h2 {
            margin-bottom: 10px;
          }
          div {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.focus();

    // ✅ trigger print → user can save as PDF
    printWindow.print();
  };

  const handleStartQuiz = async () => {
    const cid = courseInfo?.cid || courseInfo?.courses?.cid;

    const email =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress;

    if (!cid || !email) {
      alert("User or course not loaded yet");
      return;
    }

    try {
      setStartingQuiz(true); // ✅ show loader

      const res = await axios.post("/api/quiz/generate-quiz", {
        cid,
        useremail: email,
      });

      window.location.href = `/quiz/${res.data.quizId}`;
    } catch (err) {
      setStartingQuiz(false);
      console.log(err);
      alert("Failed to start quiz");
    }
  };

  

  if (startingQuiz) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-emerald-100 to-blue-100">
        <div className="flex flex-col items-center gap-6 p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200">
          <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />

          <div className="text-center">
            <h2 className="text-2xl font-bold text-emerald-700">
              Starting Quiz...
            </h2>
            <p className="text-gray-500 text-sm">Preparing your questions</p>
          </div>

          <div className="flex gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>
      </div>
    );
  }
  // Loading state
  if (!courseContent) {
    return (
      <div className="fixed top-0 left-0 w-80 p-6 border-r border-emerald-200 h-screen overflow-y-auto bg-white">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (courseContent?.length === 0) {
    return (
      <div className="fixed top-0 left-0 w-80 p-6 border-r border-emerald-200 h-screen overflow-y-auto bg-white flex flex-col items-center justify-center">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Chapters Available
        </h3>
        <p className="text-gray-500 text-center">
          This course doesn't have any chapters yet.
        </p>
      </div>
    );
  }

  // If sidebar is collapsed, show minimal version
  if (isCollapsed) {
    return (
      <div className="fixed top-0 bg-white left-0 w-16 p-4 border-r border-emerald-200 h-screen overflow-y-auto flex flex-col items-center z-40 shadow-sm">
        {/* Back to workspace button */}
        <Link
          href="/workspace"
          className="mb-3 p-2 rounded-lg hover:bg-emerald-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 group"
          title="Back to Workspace"
          aria-label="Navigate back to workspace"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-700 group-hover:-translate-x-0.5 transition-transform" />
        </Link>

        {/* Expand button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="mb-6 p-2 rounded-lg hover:bg-emerald-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          title="Expand sidebar"
          aria-label="Expand chapter sidebar"
        >
          <ChevronRight className="w-5 h-5 text-emerald-700" />
        </button>

        {/* Chapter indicators */}
        <div className="space-y-3">
          {courseContent?.map((chapter, index) => {
            const isCompleted = completedChapters.includes(index);
            const isSelected = selectedChapterIndex === index;
            const progress = calculateChapterProgress(index);

            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedChapterIndex(index);
                  if (isMobile) setIsCollapsed(false);
                }}
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all transform hover:scale-110 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                  ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-300 ring-offset-1"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
                title={`Chapter ${index + 1}: ${chapter.courseData?.chapterName || "Untitled"}`}
                aria-label={`Go to chapter ${index + 1}: ${chapter.courseData?.chapterName || "Untitled"}`}
                aria-pressed={isSelected}
              >
                {index + 1}
                {isCompleted && (
                  <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-emerald-500" />
                )}

                {/* Progress ring for incomplete chapters with progress */}
                {!isCompleted && progress > 0 && progress < 100 && (
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="#d1fae5"
                      strokeWidth="3"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile menu button for expanded view */}
        {isMobile && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mt-auto p-2 rounded-lg hover:bg-emerald-100 transition-colors"
            title="Show chapters"
            aria-label="Show chapter list"
          >
            <Menu className="w-5 h-5 text-emerald-700" />
          </button>
        )}
      </div>
    );
  }

  // Full expanded sidebar
  return (
    <>
      <div className="fixed top-0 bg-white left-0 w-80 p-6 border-r border-emerald-200 h-screen overflow-y-auto no-scrollbar transition-all duration-300 z-40 shadow-lg">
        {/* Back to workspace button */}
        <div className="mb-4 flex flex-col gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-4 py-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors group font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Workspace
          </Link>
        </div>

        {/* Sidebar header with collapse button */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-emerald-100">
          <div>
            <h2 className="font-bold text-xl text-emerald-900">
              Course Chapters
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-emerald-600 font-medium">
                {courseContent?.length} chapters
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {completedChapters.length} completed
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 rounded-lg hover:bg-emerald-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            title="Collapse sidebar"
            aria-label="Collapse chapter sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-emerald-700" />
          </button>
        </div>

        {/* Progress summary */}
        <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-800">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-emerald-700">
              {Math.round(
                (completedChapters.length / courseContent.length) * 100,
              )}
              %
            </span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(completedChapters.length / courseContent.length) * 100}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-emerald-700">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {completedChapters.length} completed
            </span>
            <span>
              {courseContent.length - completedChapters.length} remaining
            </span>
          </div>
        </div>

        {/* =========================
           FINAL QUIZ CARD
        ========================= */}
        {isCourseCompleted ? (
          <div className="mb-6 p-4 bg-linear-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg">
            <h3 className="font-semibold text-lg mb-1">Final Quiz</h3>

            <p className="text-sm opacity-90 mb-3">
              Test your knowledge and see your score
            </p>

            <button
              onClick={handleStartQuiz}
              className="w-full bg-white text-emerald-700 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-600">
            <h3 className="font-semibold text-lg mb-1">🔒 Final Quiz</h3>

            <p className="text-sm">Complete all chapters to unlock quiz</p>
          </div>
        )}
        <Accordion
          type="single"
          collapsible
          className="space-y-3"
          defaultValue={
            selectedChapterIndex !== null
              ? `chapter-${selectedChapterIndex}`
              : undefined
          }
        >
          {courseContent?.map((chapter, index) => {
            const isCompleted = completedChapters.includes(index);
            const progress = calculateChapterProgress(index);

            return (
              <AccordionItem
                value={`chapter-${index}`}
                key={index}
                onClick={() => setSelectedChapterIndex(index)}
                className={`
                rounded-xl border shadow-sm transition-all hover:shadow-md
                focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2
                ${
                  isCompleted
                    ? "bg-white border-emerald-300 shadow-md scale-[1.01] border-l-4 border-l-emerald-600"
                    : "bg-white border-emerald-200"
                }
                ${selectedChapterIndex === index ? "ring-2 ring-emerald-500 ring-offset-1" : ""}
              `}
              >
                <AccordionTrigger className="px-4 py-3 text-lg text-emerald-900 font-semibold hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">
                        {chapter.courseData?.chapterName ||
                          `Chapter ${index + 1}`}
                      </div>
                      {chapter.courseData?.duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {chapter.courseData.duration}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCompleted && progress > 0 && (
                        <div className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                          {progress}%
                        </div>
                      )}
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-2 px-4 pb-4">
                    {chapter.courseData?.topics?.length > 0 ? (
                      chapter.courseData.topics.map((topic, tIndex) => {
                        const isTopicCompleted =
                          enrollCourse?.completedTopics?.[index]?.includes(
                            tIndex,
                          );

                        return (
                          <button
                            key={tIndex}
                            className={`
                            w-full p-3 rounded-lg shadow-sm cursor-pointer transition-all border text-left
                            flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]
                            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1
                            ${
                              isTopicCompleted
                                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                                : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                            }
                          `}
                            onClick={() => handleTopicClick(tIndex)}
                            aria-label={`Go to topic: ${topic.topic}`}
                          >
                            <div
                              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs
                            ${
                              isTopicCompleted
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-300 text-gray-700"
                            }`}
                            >
                              {tIndex + 1}
                            </div>
                            <span className="flex-1 font-medium">
                              {topic.topic}
                            </span>
                            {isTopicCompleted && (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        No topics available for this chapter
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      {showFeedback && (
        <FeedbackDialog
          onClose={() => setShowFeedback(false)}
          courseInfo={courseInfo}
          user={user}
        />
      )}
    </>
  );
}
