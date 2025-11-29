import React, { useContext, useRef } from "react";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import { Video } from "lucide-react";
import YouTube from "react-youtube";

function ChapterContent({ courseInfo, topicRefs }) { // <-- accept topicRefs
  const courseContent = courseInfo?.courses?.courseContent;
  const { selectedChapterIndex } = useContext(SelectedChapterIndexContext);

  const chapter = courseContent?.[selectedChapterIndex]?.courseData;
  const videoData = courseContent?.[selectedChapterIndex]?.youtubeVideo;
  const topics = courseContent?.[selectedChapterIndex]?.courseData?.topics;

  const playersRef = useRef([]);

  const handlePlay = (playingIndex) => {
    playersRef.current.forEach((player, i) => {
      if (player && i !== playingIndex) player.pauseVideo();
    });
  };

  const handleReady = (index, event) => {
    playersRef.current[index] = event.target;
  };

  return (
    <div className="p-8 md:p-10 lg:p-12 space-y-8 w-full">
      {/* Chapter Title */}
      <h2 className="text-3xl font-extrabold text-primary flex items-start gap-2">
        <span className="text-3xl text-primary">{selectedChapterIndex + 1}.</span>
        <span className="line-clamp-1">{chapter?.chapterName || "Untitled Chapter"}</span>
      </h2>

      <div className="h-px bg-border" />

      {/* Related Videos */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          Related Videos
          <Video className="w-5 h-5 text-primary" />
        </h3>

        {videoData?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center">
            {videoData.map((video, index) => (
              <div
                key={index}
                className="w-full max-w-[480px] rounded-xl border bg-card shadow-sm hover:shadow-md transition p-4"
              >
                <h4 className="font-semibold mb-3 text-base leading-tight line-clamp-1">
                  {video?.title || `Video ${index + 1}`}
                </h4>

                <div className="w-full max-w-[350px]">
                  <div className="aspect-video w-full h-40 rounded-lg overflow-hidden">
                    <YouTube
                      videoId={video?.videoId}
                      opts={{ width: "250", height: "400", playerVars: { modestbranding: 1 } }}
                      iframeClassName="w-full h-full"
                      onReady={(event) => handleReady(index, event)}
                      onPlay={() => handlePlay(index)}
                    />
                  </div>
                  {video?.meta && <p className="text-xs text-gray-500 mt-1">{video?.meta}</p>}
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

      <div className="mt-12 space-y-10">
        {topics?.map((topic, index) => (
          <div
            key={index}
            ref={(el) => (topicRefs.current[index] = el)} // <-- attach ref
            className="p-6 rounded-xl border border-emerald-200 bg-emerald-100 shadow-sm"
          >
            <h2 className="font-bold text-emerald-900 text-xl mb-3 line-clamp-1">
              {topic?.topic}
            </h2>

            <div
              className="prose prose-emerald max-w-none"
              dangerouslySetInnerHTML={{ __html: topic?.content }}
              style={{ lineHeight: "2" }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChapterContent;
