import React, { useContext } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";

function ChapterListSidebar({ courseInfo, topicRefs }) {
  const courseContent = courseInfo?.courses?.courseContent;
  const { selectedChapterIndex, setSelectedChapterIndex } = useContext(SelectedChapterIndexContext);

  const handleTopicClick = (index) => {
    if (topicRefs.current[index]) {
      topicRefs.current[index].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed top-0 left-0 w-80 p-6 bg-emerald-50 border-r border-emerald-200 h-screen overflow-y-auto no-scrollbar">
      <h2 className="mb-4 font-bold text-xl text-emerald-900">
        Chapters ({courseContent?.length})
      </h2>

      <Accordion type="single" collapsible className="space-y-3">
        {courseContent?.map((chapter, index) => (
          <AccordionItem
            value={`chapter-${index}`}
            key={index}
            className="bg-white rounded-xl border border-emerald-200 shadow-sm"
            onClick={() => setSelectedChapterIndex(index)}
          >
            <AccordionTrigger className="px-4 py-3 text-lg text-emerald-900 font-semibold">
              {index + 1}. {chapter.courseData?.chapterName}
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-2 px-4 pb-4">
                {chapter.courseData?.topics?.map((topic, tIndex) => (
                  <div
                    key={tIndex}
                    className="p-3 bg-white rounded-lg shadow-sm border border-emerald-100 text-emerald-800 cursor-pointer hover:bg-emerald-200"
                    onClick={() => handleTopicClick(tIndex)} // <-- scroll to topic
                  >
                    {topic.topic}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default ChapterListSidebar;
