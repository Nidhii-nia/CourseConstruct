import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import { CheckCircle, ChevronLeft, ChevronRight, Menu, Clock, BookOpen } from "lucide-react";

export default function ChapterListSidebar({ courseInfo, topicRefs, onCollapseChange }) {
  const courseContent = useMemo(() => 
    courseInfo?.courses?.courseContent, 
    [courseInfo]
  );
  
  const { selectedChapterIndex, setSelectedChapterIndex } = useContext(
    SelectedChapterIndexContext
  );
  const { enrollCourse } = courseInfo ?? {};
  
  // State for sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Auto-collapse on mobile
    if (isMobile) {
      setIsCollapsed(true);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  const handleTopicClick = (index) => {
    if (topicRefs?.current?.[index]) {
      topicRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const completedChapters = useMemo(() => 
    enrollCourse?.completedChapters ?? [], 
    [enrollCourse]
  );

  // Calculate chapter progress percentage
  const calculateChapterProgress = (chapterIndex) => {
    const chapter = courseContent?.[chapterIndex];
    const totalTopics = chapter?.courseData?.topics?.length || 0;
    // Assuming you have completed topics data - adjust based on your data structure
    const completedTopics = enrollCourse?.completedTopics?.[chapterIndex]?.length || 0;
    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  };

  // Loading state
  if (!courseContent) {
    return (
      <div className="fixed top-0 left-0 w-80 p-6 border-r border-emerald-200 h-screen overflow-y-auto bg-white">
        <div className="animate-pulse space-y-4">
          {/* Sidebar header skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          </div>
          
          {/* Chapter skeletons */}
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
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Chapters Available</h3>
        <p className="text-gray-500 text-center">This course doesn't have any chapters yet.</p>
      </div>
    );
  }

  // If sidebar is collapsed, show minimal version
  if (isCollapsed) {
    return (
      <div className="fixed top-0 bg-white left-0 w-16 p-4 border-r border-emerald-200 h-screen overflow-y-auto flex flex-col items-center z-40 shadow-sm">
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
                  ${isSelected 
                    ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-300 ring-offset-1' 
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title={`Chapter ${index + 1}: ${chapter.courseData?.chapterName || 'Untitled'}`}
                aria-label={`Go to chapter ${index + 1}: ${chapter.courseData?.chapterName || 'Untitled'}`}
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
    <div className="fixed top-0 bg-white left-0 w-80 p-6 border-r border-emerald-200 h-screen overflow-y-auto no-scrollbar transition-all duration-300 z-40 shadow-lg">
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
          <span className="text-sm font-medium text-emerald-800">Overall Progress</span>
          <span className="text-sm font-bold text-emerald-700">
            {Math.round((completedChapters.length / courseContent.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-emerald-200 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedChapters.length / courseContent.length) * 100}%` }}
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

      <Accordion 
        type="single" 
        collapsible 
        className="space-y-3"
        defaultValue={selectedChapterIndex !== null ? `chapter-${selectedChapterIndex}` : undefined}
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
                ${isCompleted
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
                      {chapter.courseData?.chapterName || `Chapter ${index + 1}`}
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
                      // Check if this topic is completed (adjust based on your data structure)
                      const isTopicCompleted = enrollCourse?.completedTopics?.[index]?.includes(tIndex);
                      
                      return (
                        <button
                          key={tIndex}
                          className={`
                            w-full p-3 rounded-lg shadow-sm cursor-pointer transition-all border text-left
                            flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]
                            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1
                            ${isTopicCompleted
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                              : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                            }
                          `}
                          onClick={() => handleTopicClick(tIndex)}
                          aria-label={`Go to topic: ${topic.topic}`}
                        >
                          <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs
                            ${isTopicCompleted 
                              ? "bg-emerald-500 text-white" 
                              : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            {tIndex + 1}
                          </div>
                          <span className="flex-1 font-medium">{topic.topic}</span>
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
  );
}