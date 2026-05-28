"use client";

import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";

import { useSidebar } from "@/context/SidebarContext";

import { CheckCircle, Video, Loader2, XCircle } from "lucide-react";

import YouTube from "react-youtube";

import { Button } from "@/components/ui/button";

import axios from "axios";

import { useParams } from "next/navigation";

import { toast } from "sonner";

import { MathJax, MathJaxContext } from "better-react-mathjax";

function ChapterContent({ courseInfo, topicRefs, refreshData }) {
  const { courseId } = useParams();

  const enrollCourse = courseInfo?.enrollCourse;

  const courseContent = courseInfo?.courses?.courseContent || [];

  const { selectedChapterIndex } = useContext(SelectedChapterIndexContext);

  const { isCollapsed } = useSidebar();

  const chapter = courseContent?.[selectedChapterIndex]?.courseData;

  const youtubeContent = courseContent?.[selectedChapterIndex]?.youtubeContent;

  const videoData = youtubeContent?.videos || [];

  const playlistData = youtubeContent?.playlists || [];

  const includeVideo =
  courseInfo?.courses?.includeVideo === true ||
  courseInfo?.courses?.includeVideo === "true";

    console.log("📺 ChapterContent - includeVideo:", includeVideo);
  console.log("📺 ChapterContent - youtubeContent:", youtubeContent);
  console.log("📺 ChapterContent - videoData:", videoData);
  console.log("📺 ChapterContent - videoData length:", videoData.length);
  console.log("📺 ChapterContent - playlistData length:", playlistData.length);

  const topics = courseContent?.[selectedChapterIndex]?.courseData?.topics;

  /* =========================
     STATES
  ========================= */

  const [completing, setCompleting] = useState(false);

  const [incompleting, setIncompleting] = useState(false);

  const [localIsCompleted, setLocalIsCompleted] = useState(false);

  const playersRef = useRef([]);

  /* =========================
     UPDATE LOCAL STATE
  ========================= */

  useEffect(() => {
    const completedChapters = enrollCourse?.completedChapters ?? [];

    const isCompleted = completedChapters?.includes(selectedChapterIndex);

    setLocalIsCompleted(isCompleted);
  }, [selectedChapterIndex, enrollCourse]);

  /* =========================
     VIDEO CONTROL
  ========================= */

  const handlePlay = (playingIndex) => {
    playersRef.current.forEach((player, i) => {
      if (player && i !== playingIndex) {
        player.pauseVideo();
      }
    });
  };

  const handleReady = (index, event) => {
    playersRef.current[index] = event.target;
  };

  /* =========================
     MARK COMPLETE
  ========================= */

  const markChapterCompleted = async () => {
    if (completing || incompleting) return;

    setCompleting(true);

    const completedChapters = enrollCourse?.completedChapters ?? [];

    const updatedChapters = Array.from(
      new Set([...completedChapters, selectedChapterIndex]),
    );

    try {
      /* INSTANT UI */
      setLocalIsCompleted(true);

      /* SIDEBAR UPDATE */
      if (refreshData) {
        refreshData({
          ...courseInfo,

          enrollCourse: {
            ...courseInfo?.enrollCourse,

            completedChapters: updatedChapters,
          },
        });
      }

      /* API */
      await axios.put("/api/enroll-course", {
        courseId,

        completedChapters: updatedChapters,
      });

      toast.success("Marked as Completed!");
    } catch (error) {
      console.error("API Error:", error);

      /* ROLLBACK */
      setLocalIsCompleted(false);

      if (refreshData) {
        refreshData({
          ...courseInfo,

          enrollCourse: {
            ...courseInfo?.enrollCourse,

            completedChapters: completedChapters,
          },
        });
      }

      toast.error("Failed to save");
    } finally {
      setCompleting(false);
    }
  };

  /* =========================
     MARK INCOMPLETE
  ========================= */

  const markIncompleteChapter = async () => {
    if (incompleting || completing) return;

    setIncompleting(true);

    const completedChapters = enrollCourse?.completedChapters ?? [];

    const updatedChapters = completedChapters.filter(
      (item) => item !== selectedChapterIndex,
    );

    try {
      /* INSTANT UI */
      setLocalIsCompleted(false);

      /* SIDEBAR UPDATE */
      if (refreshData) {
        refreshData({
          ...courseInfo,

          enrollCourse: {
            ...courseInfo?.enrollCourse,

            completedChapters: updatedChapters,
          },
        });
      }

      /* API */
      await axios.put("/api/enroll-course", {
        courseId,

        completedChapters: updatedChapters,
      });

      toast.success("Marked as Incomplete!");
    } catch (error) {
      console.error("API Error:", error);

      /* ROLLBACK */
      setLocalIsCompleted(true);

      if (refreshData) {
        refreshData({
          ...courseInfo,

          enrollCourse: {
            ...courseInfo?.enrollCourse,

            completedChapters: completedChapters,
          },
        });
      }

      toast.error("Failed to save");
    } finally {
      setIncompleting(false);
    }
  };

  // Add this configuration for better MathJax handling
const mathJaxConfig = {
  loader: {
    load: ['input/tex', 'output/chtml']
  },
  tex: {
    packages: ['base', 'ams', 'newcommand'],
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    ignoreHtmlClass: 'no-mathjax',
    processHtmlClass: 'math'
  },
  chtml: {
    scale: 1,
    minScale: 0.5,
    matchFontHeight: true
  }
};

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div
        className={`
          transition-all
          duration-300

          ${isCollapsed ? "ml-0 lg:ml-20" : "ml-0 lg:ml-80"}
        `}
      >
        {/* MAIN CONTAINER */}
        <div
          className="
            w-full

            px-4
            sm:px-6
            lg:px-8
            xl:px-10

            py-6
            lg:py-10

            space-y-8

            overflow-hidden
          "
        >
          {/* CHAPTER HEADER */}
          <div
            className="
    max-w-6xl

    mx-auto

    flex
    items-start
    justify-between

    gap-4

    flex-wrap
  "
          >
            {/* TITLE */}
            <div className="flex-1 min-w-0">
              <h2
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl

                  font-black

                  text-emerald-700
                  dark:text-emerald-300

                  leading-tight

                  wrap-break-word
                "
              >
                {chapter?.chapterName}
              </h2>
            </div>

            {/* BUTTON */}
            <div
              className="shrink-0 ml-auto "
            >
              {!localIsCompleted ? (
                <Button
                  onClick={markChapterCompleted}
                  disabled={completing || incompleting || localIsCompleted}
                  className="
w-auto

                    min-w-55

                    rounded-2xl

                    h-11

                    font-medium

                    shadow-lg
                    hover:shadow-xl

                    transition-all
                    duration-300
                  "
                >
                  {completing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Marking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Mark as Completed
                    </span>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={markIncompleteChapter}
                  disabled={incompleting || completing || !localIsCompleted}
                  className="
                    bg-green-600
                    hover:bg-green-700

w-auto

                    min-w-55

                    rounded-2xl

                    h-11

                    font-medium

                    shadow-lg
                    hover:shadow-xl

                    transition-all
                    duration-300
                  "
                >
                  {incompleting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Marking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Mark as Incomplete
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="max-w-6xl mx-auto h-px bg-border" />

          {/* VIDEOS */}
{/* VIDEOS */}
{includeVideo &&
  (videoData?.length > 0 || playlistData?.length > 0) && (
    <div className="max-w-6xl mx-auto space-y-4">
      {console.log("📺 RENDERING VIDEOS - Count:", videoData.length)}
      {/* HEADING */}
      <div className="flex items-center gap-2">
        <h3
          className="
            text-lg
            sm:text-xl
            font-bold
            text-gray-800
            dark:text-white
          "
        >
          Related Videos
        </h3>
        <Video className="w-4 h-4 text-emerald-500" />
      </div>

      {/* VIDEO GRID - SMALLER CARDS */}
      <div
        className={`
          grid
          gap-3
          sm:gap-4
          ${
            isCollapsed
              ? `
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-3
              `
              : `
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-2
                xl:grid-cols-3
              `
          }
        `}
      >
        {videoData
          .filter((video) => video?.videoId)
          .map((video, index) => (
            <div
              key={index}
              className="
                rounded-xl
                border
                border-emerald-200
                dark:border-emerald-500/20
                bg-white/90
                dark:bg-gray-900/70
                backdrop-blur-xl
                shadow-md
                hover:shadow-lg
                transition-all
                duration-300
                overflow-hidden
              "
            >
              {/* VIDEO - SMALLER */}
              <div className="aspect-video w-full overflow-hidden">
                <YouTube
                  videoId={video?.videoId}
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                    },
                  }}
                  iframeClassName="w-full h-full"
                  onReady={(event) => handleReady(index, event)}
                  onPlay={() => handlePlay(index)}
                />
              </div>

              {/* CONTENT - SMALLER PADDING */}
              <div className="p-3 sm:p-4">
                <h4
                  className="
                    font-semibold
                    text-sm
                    sm:text-base
                    text-gray-800
                    dark:text-white
                    leading-snug
                    line-clamp-2
                  "
                >
                  {video?.title}
                </h4>
                {video?.meta && (
                  <p
                    className="
                      text-xs
                      text-gray-500
                      dark:text-gray-400
                      mt-1
                      line-clamp-1
                    "
                  >
                    {video?.meta}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* PLAYLISTS - SMALLER CARDS */}
      {playlistData?.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3
            className="
              text-lg
              sm:text-xl
              font-bold
              text-gray-800
              dark:text-white
            "
          >
            Recommended Playlists
          </h3>

          <div
            className={`
              grid
              gap-3
              sm:gap-4
              ${
                isCollapsed
                  ? `
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-3
                  `
                  : `
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-2
                    xl:grid-cols-3
                  `
              }
            `}
          >
            {playlistData.map((playlist, index) => (
              <a
                key={index}
                href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  rounded-xl
                  border
                  border-emerald-200
                  dark:border-emerald-500/20
                  bg-white/90
                  dark:bg-gray-900/70
                  backdrop-blur-xl
                  shadow-md
                  hover:shadow-lg
                  transition-all
                  duration-300
                  overflow-hidden
                  group
                "
              >
                <img
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="
                    w-full
                    aspect-video
                    object-cover
                    group-hover:scale-105
                    transition-transform
                    duration-300
                  "
                />
                <div className="p-3 sm:p-4">
                  <h4
                    className="
                      font-semibold
                      text-sm
                      sm:text-base
                      text-gray-800
                      dark:text-white
                      line-clamp-2
                    "
                  >
                    {playlist.title}
                  </h4>
                  <p
                    className="
                      text-xs
                      text-gray-500
                      dark:text-gray-400
                      mt-1
                      line-clamp-1
                    "
                  >
                    {playlist.channelTitle}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )}

          {/* TOPICS */}
          <div className="max-w-6xl mx-auto space-y-8 lg:space-y-10">
            {topics?.map((topic, index) => (
              <div
                key={index}
                ref={(el) => (topicRefs.current[index] = el)}
                className="
                    rounded-3xl

                    border
                    border-emerald-200
                    dark:border-emerald-500/20

                    bg-white/90
                    dark:bg-gray-900/70

                    backdrop-blur-xl

                    shadow-lg
                    hover:shadow-xl

                    transition-all
                    duration-300

                    p-5
                    sm:p-7
                    lg:p-8

                    overflow-hidden
                  "
              >
<MathJax dynamic>
  <div
    className="
        course-content

        max-w-none

        overflow-hidden

        wrap-break-word

        prose-pre:overflow-x-auto
        prose-code:wrap-break-word
        prose-img:max-w-full
      "
    dangerouslySetInnerHTML={{
      __html: topic?.content,
    }}
    style={{
      lineHeight: "1.9",
    }}
  />
</MathJax>
              </div>
            ))}
          </div>
        </div>

        {/* HIDDEN PDF CONTENT */}
        <div
          id="full-course-pdf"
          style={{
            position: "absolute",

            left: "-9999px",

            width: "800px",
          }}
        >
          {/* TITLE */}
          <h1
            style={{
              textAlign: "center",

              fontSize: "28px",

              marginBottom: "20px",
            }}
          >
            {courseInfo?.courses?.courseName}
          </h1>

          {courseContent?.map((chap, cIndex) => (
            <div
              key={cIndex}
              style={{
                marginBottom: "40px",

                pageBreakAfter: "always",
              }}
            >
              {/* CHAPTER */}
              <h2
                style={{
                  fontSize: "22px",

                  marginBottom: "10px",
                }}
              >
                {chap?.courseData?.chapterName}
              </h2>

              {/* TOPICS */}
              {chap?.courseData?.topics?.map((topic, tIndex) => (
                <div
                  key={tIndex}
                  style={{
                    marginBottom: "15px",
                  }}
                >
                  <MathJax dynamic>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: topic?.content,
                      }}
                    />
                  </MathJax>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </MathJaxContext>
  );
}

export default ChapterContent;
