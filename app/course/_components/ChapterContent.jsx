"use client";

import React, { useContext, useRef, useState, useEffect } from "react";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import { useSidebar } from "@/context/SidebarContext";
import { CheckCircle, Video, Loader2, CrossIcon } from "lucide-react";
import YouTube from "react-youtube";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "sonner";

function ChapterContent({ courseInfo, topicRefs, refreshData }) {
  const { courseId } = useParams();
  const { courses, enrollCourse } = courseInfo ?? {};
  const courseContent = courseInfo?.courses?.courseContent;
  const { selectedChapterIndex } = useContext(SelectedChapterIndexContext);
  const { isCollapsed } = useSidebar();

  const chapter = courseContent?.[selectedChapterIndex]?.courseData;
  const videoData = courseContent?.[selectedChapterIndex]?.youtubeVideo;
  const topics = courseContent?.[selectedChapterIndex]?.courseData?.topics;

  // Local loading states for buttons
  const [completing, setCompleting] = useState(false);
  const [incompleting, setIncompleting] = useState(false);
  
  // LOCAL STATE for immediate button change
  const [localIsCompleted, setLocalIsCompleted] = useState(false);
  
  const playersRef = useRef([]);

  // Update local state when selected chapter or courseInfo changes
  useEffect(() => {
    const completedChapters = enrollCourse?.completedChapters ?? [];
    const isCompleted = completedChapters?.includes(selectedChapterIndex);
    setLocalIsCompleted(isCompleted);
  }, [selectedChapterIndex, enrollCourse]);

  const handlePlay = (playingIndex) => {
    playersRef.current.forEach((player, i) => {
      if (player && i !== playingIndex) player.pauseVideo();
    });
  };

  const handleReady = (index, event) => {
    playersRef.current[index] = event.target;
  };

  const markChapterCompleted = async () => {
    if (completing || incompleting) return;
    
    setCompleting(true);
    
    try {
      // INSTANT: Change button state
      setLocalIsCompleted(true);
      
      // Get current completed chapters
      const completedChapters = enrollCourse?.completedChapters ?? [];
      const updatedChapters = [...completedChapters, selectedChapterIndex];
      
      // Call API in background
      axios.put("/api/enroll-course", {
        courseId,
        completedChapters: updatedChapters,
      })
      .then(() => {
        toast.success("Marked as Completed!");
        // Refresh parent in background
        if (refreshData) {
          refreshData({
            ...courseInfo,
            enrollCourse: {
              ...courseInfo?.enrollCourse,
              completedChapters: updatedChapters
            }
          });
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        // Revert on error
        setLocalIsCompleted(false);
        toast.error("Failed to save");
      });
      
    } catch (error) {
      console.error("Error:", error);
      setLocalIsCompleted(false);
      toast.error("Failed to mark as completed");
    } finally {
      setCompleting(false);
    }
  };

  const markIncompleteChapter = async () => {
    if (incompleting || completing) return;
    
    setIncompleting(true);
    
    try {
      // INSTANT: Change button state
      setLocalIsCompleted(false);
      
      // Get current completed chapters
      const completedChapters = enrollCourse?.completedChapters ?? [];
      const updatedChapters = completedChapters.filter(
        (item) => item !== selectedChapterIndex
      );
      
      // Call API in background
      axios.put("/api/enroll-course", {
        courseId,
        completedChapters: updatedChapters,
      })
      .then(() => {
        toast.success("Marked as Incomplete!");
        // Refresh parent in background
        if (refreshData) {
          refreshData({
            ...courseInfo,
            enrollCourse: {
              ...courseInfo?.enrollCourse,
              completedChapters: updatedChapters
            }
          });
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        // Revert on error
        setLocalIsCompleted(true);
        toast.error("Failed to save");
      });
      
    } catch (error) {
      console.error("Error:", error);
      setLocalIsCompleted(true);
      toast.error("Failed to mark as incomplete");
    } finally {
      setIncompleting(false);
    }
  };

  // Show loading only if no courseInfo at all
  if (!courseInfo) {
    return (
      <div className={`${isCollapsed ? 'ml-5' : 'ml-5 lg:ml-80'} transition-all duration-300 w-full flex items-center justify-center min-h-[400px]`}>
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isCollapsed ? 'ml-17' : 'ml-17 lg:ml-80'} transition-all duration-300`}>
      {/* Main content container with responsive width */}
      <div className={`${isCollapsed ? 'max-w-7xl mx-auto px-4 md:px-8' : ''} p-4 md:p-8 lg:p-10 xl:p-12 space-y-6 md:space-y-8 w-full`}>
        {/* Chapter Title Section */}
        <div className={`${isCollapsed ? 'max-w-6xl mx-auto' : ''} flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4`}>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary flex items-start gap-2">
              <span className="line-clamp-2 wrap-break-word">
                {chapter?.chapterName || "Untitled Chapter"}
              </span>
            </h2>
          </div>

          {/* Mark Complete/Incomplete Buttons */}
          <div className="shrink-0 self-start">
            {!localIsCompleted ? (
              <Button 
                onClick={markChapterCompleted} 
                disabled={completing}
                className={`w-full sm:w-auto min-w-40`}
                size="sm"
              >
                {completing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Marking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Mark as Completed
                  </span>
                )}
              </Button>
            ) : (
              <Button 
                className={'bg-green-600 hover:bg-green-700 w-full sm:w-auto min-w-40'} 
                onClick={markIncompleteChapter}
                disabled={incompleting}
                size="sm"
              >
                {incompleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Marking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CrossIcon className="mr-2 w-3 h-3" />
                    Mark as Incomplete
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className={`${isCollapsed ? 'max-w-6xl mx-auto' : ''} h-px bg-border w-full`} />

        {/* Related Videos Section - Responsive columns */}
        <div className={`${isCollapsed ? 'max-w-6xl mx-auto' : ''} space-y-4`}>
          <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            Related Videos
            <Video className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </h3>

          {videoData?.length > 0 ? (
            <div className={`grid ${isCollapsed ? 'grid-cols-1 lg:grid-cols-3 gap-6' : 'grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'}`}>
              {videoData.map((video, index) => (
                <div
                  key={index}
                  className="w-full rounded-xl border border-emerald-300 bg-card shadow-sm hover:shadow-md transition p-3 md:p-4"
                >
                  <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base leading-tight line-clamp-1">
                    {video?.title || `Video ${index + 1}`}
                  </h4>

                  <div className="w-full">
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                      <YouTube
                        videoId={video?.videoId}
                        opts={{
                          width: "100%",
                          height: "100%",
                          playerVars: { 
                            modestbranding: 1,
                            rel: 0
                          },
                        }}
                        iframeClassName="w-full h-full"
                        onReady={(event) => handleReady(index, event)}
                        onPlay={() => handlePlay(index)}
                      />
                    </div>
                    {video?.meta && (
                      <p className="text-xs text-gray-500 mt-1">{video?.meta}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-40 bg-accent/10 rounded-xl border border-accent/30 flex items-center justify-center text-muted-foreground">
              No videos uploaded yet.
            </div>
          )}
        </div>

        {/* Topics Section */}
        <div className={`${isCollapsed ? 'max-w-6xl mx-auto' : ''} mt-8 md:mt-10 lg:mt-12 space-y-6 md:space-y-8 lg:space-y-10`}>
          {topics?.map((topic, index) => (
            <div
              key={index}
              ref={(el) => (topicRefs.current[index] = el)}
              className="p-4 md:p-5 lg:p-6 rounded-xl border border-emerald-100 bg-emerald-50 shadow-sm"
            >
              <h2 className="font-bold text-emerald-900 text-lg md:text-xl mb-2 md:mb-3 line-clamp-1">
                {topic?.topic}
              </h2>

              <div
                className="prose prose-emerald max-w-none prose-sm md:prose-base"
                dangerouslySetInnerHTML={{ __html: topic?.content }}
                style={{ lineHeight: "1.8" }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChapterContent;