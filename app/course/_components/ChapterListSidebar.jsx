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
  Download,
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

import { useUser } from "@clerk/nextjs";

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

  useEffect(() => {
    if (!courseContent || courseContent.length === 0) return;

    if (isCourseCompleted && cid) {
      setShowFeedback(true);
    }
  }, [isCourseCompleted, cid, courseContent]);

  /* =========================
     SIDEBAR STATE
  ========================= */

  const { isCollapsed, setIsCollapsed } = useSidebar();

  const [isMobile, setIsMobile] = useState(false);

  /* =========================
     MOBILE CHECK
  ========================= */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    if (isMobile) {
      setIsCollapsed(true);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile, setIsCollapsed]);

  /* =========================
     TOPIC CLICK
  ========================= */

  const handleTopicClick = (index) => {
    if (topicRefs?.current?.[index]) {
      topicRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================
     PROGRESS
  ========================= */

  const calculateChapterProgress = (chapterIndex) => {
    const chapter = courseContent?.[chapterIndex];

    const totalTopics = chapter?.courseData?.topics?.length || 0;

    const completedTopics =
      enrollCourse?.completedTopics?.[chapterIndex]?.length || 0;

    return totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;
  };

  /* =========================
     EXPORT PDF
  ========================= */

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

    printWindow.print();
  };

  /* =========================
   START QUIZ
========================= */

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
      setStartingQuiz(true);

      const res = await axios.post("/api/quiz/generate-quiz", {
        cid,
        useremail: email,
      });

      /* SMOOTH REDIRECT */
      setTimeout(() => {
        window.location.assign(`/quiz/${res.data.quizId}`);
      }, 400);
    } catch (err) {
      setStartingQuiz(false);

      console.log(err);

      alert("Failed to start quiz");
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (!courseContent) {
    return (
      <div
        className="
          fixed
          top-0
          left-0

          w-80

          p-6

          border-r
          border-emerald-200
          dark:border-emerald-500/20

          h-screen

          overflow-y-auto

          bg-white
          dark:bg-gray-950
        "
      >
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>

            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  /* =========================
     EMPTY STATE
  ========================= */

  if (courseContent?.length === 0) {
    return (
      <div
        className="
          fixed
          top-0
          left-0

          w-80

          p-6

          border-r
          border-emerald-200
          dark:border-emerald-500/20

          h-screen

          overflow-y-auto

          bg-white
          dark:bg-gray-950

          flex
          flex-col
          items-center
          justify-center
        "
      >
        <BookOpen
          className="
            w-16
            h-16

            text-gray-300
            dark:text-gray-700

            mb-4
          "
        />

        <h3
          className="
            text-lg
            font-semibold

            text-gray-700
            dark:text-white

            mb-2
          "
        >
          No Chapters Available
        </h3>

        <p
          className="
            text-gray-500
            dark:text-gray-400

            text-center
          "
        >
          This course doesn't have any chapters yet.
        </p>
      </div>
    );
  }

  /* =========================
     COLLAPSED SIDEBAR
  ========================= */

  if (isCollapsed) {
    return (
      <div
        className="
          fixed
          top-0
          left-0

          w-16

          p-4

          border-r
          border-emerald-200
          dark:border-emerald-500/20

          h-screen

          overflow-y-auto

          flex
          flex-col
          items-center

          z-40

          shadow-sm

          bg-white/90
          dark:bg-gray-950/90

          backdrop-blur-xl
        "
      >
        {/* BACK */}
        <Link
          href="/workspace"
          className="
            mb-3

            p-2

            rounded-xl

            hover:bg-emerald-100
            dark:hover:bg-gray-800

            transition-colors

            group
          "
        >
          <ArrowLeft
            className="
              w-5
              h-5

              text-emerald-700
              dark:text-emerald-300

              group-hover:-translate-x-0.5

              transition-transform
            "
          />
        </Link>

        {/* EXPAND */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="
            mb-6

            p-2

            rounded-xl

            hover:bg-emerald-100
            dark:hover:bg-gray-800

            transition-colors
          "
        >
          <ChevronRight
            className="
              w-5
              h-5

              text-emerald-700
              dark:text-emerald-300
            "
          />
        </button>

        {/* CHAPTERS */}
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
                    relative

                    w-10
                    h-10

                    rounded-full

                    flex
                    items-center
                    justify-center

                    text-sm
                    font-semibold

                    transition-all

                    hover:scale-110

                    ${
                      isSelected
                        ? `
                          bg-emerald-600
                          text-white

                          shadow-lg
                        `
                        : isCompleted
                          ? `
                          bg-emerald-100
                          dark:bg-emerald-500/20

                          text-emerald-700
                          dark:text-emerald-300

                          border-2
                          border-emerald-300
                        `
                          : `
                          bg-gray-100
                          dark:bg-gray-800

                          text-gray-700
                          dark:text-gray-300
                        `
                    }
                  `}
              >
                {index + 1}

                {isCompleted && (
                  <CheckCircle
                    className="
                        absolute
                        -top-1
                        -right-1

                        w-3
                        h-3

                        text-emerald-500
                      "
                  />
                )}

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
                      strokeDashoffset={`${
                        2 * Math.PI * 18 * (1 - progress / 100)
                      }`}
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* MOBILE */}
        {isMobile && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="
              mt-auto

              p-2

              rounded-xl

              hover:bg-emerald-100
              dark:hover:bg-gray-800
            "
          >
            <Menu
              className="
                w-5
                h-5

                text-emerald-700
                dark:text-emerald-300
              "
            />
          </button>
        )}
      </div>
    );
  }

  /* =========================
     FULL SIDEBAR
  ========================= */

  return (
    <>
      <div
        className="
          fixed
          top-0
          left-0

          w-80

          p-6

          border-r
          border-emerald-200
          dark:border-emerald-500/20

          h-screen

          overflow-y-auto

          no-scrollbar

          transition-all
          duration-300

          z-40

          shadow-xl

          bg-white/95
          dark:bg-gray-950/95

          backdrop-blur-xl
        "
      >
        {/* HEADER BUTTONS */}
        <div className="mt-12 mb-4 flex flex-col gap-2">
          <button
            onClick={handleExportPDF}
            className="
              flex
              items-center
              justify-center

              gap-2

              px-4
              py-2.5

              bg-emerald-600
              hover:bg-emerald-700

              text-white

              rounded-2xl

              transition-all
              duration-300

              shadow-lg
              hover:shadow-xl
            "
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>

          <Link
            href="/workspace"
            className="
              inline-flex
              items-center

              gap-2

              px-4
              py-2.5

              text-emerald-700
              dark:text-emerald-300

              hover:bg-emerald-50
              dark:hover:bg-gray-800

              rounded-2xl

              transition-all
            "
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Link>
        </div>

        {/* SIDEBAR HEADER */}
        <div
          className="
            flex
            justify-between
            items-center

            mb-6

            pb-4

            border-b
            border-emerald-100
            dark:border-gray-800
          "
        >
          <div>
            <h2
              className="
                font-bold
                text-xl

                text-emerald-900
                dark:text-white
              "
            >
              Course Chapters
            </h2>

            <div className="flex items-center gap-2 mt-1">
              <span
                className="
                  text-sm

                  text-emerald-600
                  dark:text-emerald-300

                  font-medium
                "
              >
                {courseContent?.length} chapters
              </span>

              <span className="text-gray-400">•</span>

              <span
                className="
                  text-sm

                  text-gray-500
                  dark:text-gray-400
                "
              >
                {completedChapters.length} completed
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(true)}
            className="
              p-2

              rounded-xl

              hover:bg-emerald-100
              dark:hover:bg-gray-800

              transition-colors
            "
          >
            <ChevronLeft
              className="
                w-5
                h-5

                text-emerald-700
                dark:text-emerald-300
              "
            />
          </button>
        </div>

        {/* PROGRESS */}
        <div
          className="
            mb-6

            p-4

            bg-emerald-50
            dark:bg-emerald-500/10

            rounded-2xl

            border
            border-emerald-200
            dark:border-emerald-500/20
          "
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="
                text-sm
                font-medium

                text-emerald-800
                dark:text-emerald-300
              "
            >
              Overall Progress
            </span>

            <span
              className="
                text-sm
                font-bold

                text-emerald-700
                dark:text-emerald-300
              "
            >
              {Math.round(
                (completedChapters.length / courseContent.length) * 100,
              )}
              %
            </span>
          </div>

          <div
            className="
              w-full

              bg-emerald-200
              dark:bg-gray-800

              rounded-full

              h-2
            "
          >
            <div
              className="
                bg-emerald-600

                h-2

                rounded-full

                transition-all
                duration-500
              "
              style={{
                width: `${
                  (completedChapters.length / courseContent.length) * 100
                }%`,
              }}
            />
          </div>

          <div
            className="
              flex
              items-center
              justify-between

              mt-3

              text-xs

              text-emerald-700
              dark:text-emerald-300
            "
          >
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {completedChapters.length} completed
            </span>

            <span>
              {courseContent.length - completedChapters.length} remaining
            </span>
          </div>
        </div>

        {/* QUIZ */}
        {isCourseCompleted ? (
          <div
            className="
              mb-6

              p-5

              bg-gradient-to-br
              from-emerald-500
              to-emerald-600

              text-white

              rounded-3xl

              shadow-xl
            "
          >
            <h3 className="font-semibold text-lg mb-1">Final Quiz</h3>

            <p className="text-sm opacity-90 mb-4">
              Test your knowledge and see your score
            </p>

            <button
              onClick={handleStartQuiz}
              className="
                w-full

                bg-white

                text-emerald-700

                font-semibold

                py-2.5

                rounded-2xl

                hover:bg-gray-100

                transition-all
              "
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <div
            className="
              mb-6

              p-4

              bg-gray-100
              dark:bg-gray-900

              border
              border-gray-200
              dark:border-gray-800

              rounded-2xl

              text-gray-600
              dark:text-gray-300
            "
          >
            <h3 className="font-semibold text-lg mb-1">🔒 Final Quiz</h3>

            <p className="text-sm">Complete all chapters to unlock quiz</p>
          </div>
        )}

        {/* ACCORDION */}
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
                    rounded-2xl

                    border

                    shadow-sm
                    hover:shadow-lg

                    transition-all

                    overflow-hidden

                    ${
                      isCompleted
                        ? `
                          bg-white
                          dark:bg-gray-900

                          border-emerald-300
                          dark:border-emerald-500/20

                          border-l-4
                          border-l-emerald-600
                        `
                        : `
                          bg-white
                          dark:bg-gray-900

                          border-emerald-200
                          dark:border-gray-800
                        `
                    }

                    ${
                      selectedChapterIndex === index
                        ? `
                          ring-2
                          ring-emerald-500
                          ring-offset-1
                        `
                        : ""
                    }
                  `}
              >
                <AccordionTrigger
                  className="
                      px-4
                      py-4

                      text-lg

                      text-emerald-900
                      dark:text-white

                      font-semibold

                      hover:no-underline
                    "
                >
                  <div className="flex items-center gap-3 w-full">
                    <span
                      className="
                          flex
                          items-center
                          justify-center

                          w-7
                          h-7

                          rounded-full

                          bg-emerald-100
                          dark:bg-emerald-500/20

                          text-emerald-700
                          dark:text-emerald-300

                          text-sm
                          font-bold
                        "
                    >
                      {index + 1}
                    </span>

                    <div className="flex-1 text-left min-w-0">
                      <div
                        className="
                            font-semibold

                            text-gray-900
                            dark:text-white

                            break-words
                          "
                      >
                        {chapter.courseData?.chapterName}
                      </div>

                      {chapter.courseData?.duration && (
                        <div
                          className="
                              flex
                              items-center

                              gap-1

                              text-xs

                              text-gray-500
                              dark:text-gray-400

                              mt-1
                            "
                        >
                          <Clock className="w-3 h-3" />

                          {chapter.courseData.duration}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCompleted && progress > 0 && (
                        <div
                          className="
                                text-xs
                                font-medium

                                text-emerald-700
                                dark:text-emerald-300

                                bg-emerald-100
                                dark:bg-emerald-500/20

                                px-2
                                py-1

                                rounded-full
                              "
                        >
                          {progress}%
                        </div>
                      )}

                      {isCompleted && (
                        <CheckCircle
                          className="
                              w-5
                              h-5

                              text-emerald-500
                            "
                        />
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
                                  w-full

                                  p-3

                                  rounded-2xl

                                  shadow-sm

                                  cursor-pointer

                                  transition-all

                                  border

                                  text-left

                                  flex
                                  items-center

                                  gap-3

                                  hover:scale-[1.02]

                                  ${
                                    isTopicCompleted
                                      ? `
                                        bg-emerald-50
                                        dark:bg-emerald-500/10

                                        border-emerald-300
                                        dark:border-emerald-500/20

                                        text-emerald-900
                                        dark:text-emerald-200
                                      `
                                      : `
                                        bg-gray-50
                                        dark:bg-gray-800

                                        border-gray-200
                                        dark:border-gray-700

                                        text-gray-800
                                        dark:text-gray-200

                                        hover:bg-gray-100
                                        dark:hover:bg-gray-700
                                      `
                                  }
                                `}
                            onClick={() => handleTopicClick(tIndex)}
                          >
                            <div
                              className={`
                                    shrink-0

                                    w-6
                                    h-6

                                    rounded-full

                                    flex
                                    items-center
                                    justify-center

                                    text-xs

                                    ${
                                      isTopicCompleted
                                        ? `
                                          bg-emerald-500
                                          text-white
                                        `
                                        : `
                                          bg-gray-300
                                          dark:bg-gray-700

                                          text-gray-700
                                          dark:text-gray-300
                                        `
                                    }
                                  `}
                            >
                              {tIndex + 1}
                            </div>

                            <span className="flex-1 font-medium break-words">
                              {topic.topic}
                            </span>

                            {isTopicCompleted && (
                              <CheckCircle
                                className="
                                      w-4
                                      h-4

                                      text-emerald-500

                                      shrink-0
                                    "
                              />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div
                        className="
                            p-4

                            text-center

                            text-gray-500
                            dark:text-gray-400

                            bg-gray-50
                            dark:bg-gray-800

                            rounded-2xl
                          "
                      >
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

      {/* FEEDBACK */}
      {showFeedback && (
        <FeedbackDialog
          onClose={() => setShowFeedback(false)}
          courseInfo={courseInfo}
          user={user}
        />
      )}

      {/* =========================
    QUIZ LOADER OVERLAY
========================= */}

{startingQuiz && (
  <div
    className="
      fixed
      inset-0

      z-[9999]

      bg-black/40

      backdrop-blur-md

      flex
      items-center
      justify-center

      px-4
    "
  >
    <div
      className="
        flex
        flex-col
        items-center

        gap-6

        p-8
        sm:p-10

        bg-white/90
        dark:bg-gray-900/90

        rounded-3xl

        shadow-2xl

        border
        border-emerald-200
        dark:border-emerald-500/20

        max-w-sm
        w-full
      "
    >
      {/* SPINNER */}
      <Loader2
        className="
          w-14
          h-14

          text-emerald-600
          dark:text-emerald-300

          animate-spin
        "
      />

      {/* TEXT */}
      <div className="text-center">

        <h2
          className="
            text-2xl
            font-bold

            text-emerald-700
            dark:text-emerald-300
          "
        >
          Starting Quiz...
        </h2>

        <p
          className="
            text-gray-500
            dark:text-gray-400

            text-sm

            mt-2
          "
        >
          Preparing your quiz
        </p>

      </div>

      {/* DOTS */}
      <div className="flex gap-2">

        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>

        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></span>

        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></span>

      </div>
    </div>
  </div>
)}
    </>
  );
}