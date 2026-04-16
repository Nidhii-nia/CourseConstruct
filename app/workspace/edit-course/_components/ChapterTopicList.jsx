"use client";

import {
  Gift,
  ChevronDown,
  ChevronUp,
  Loader2,
  Edit2,
  Trash2,
  Save,
  X,
  Plus,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

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
    return rem
      ? `${hrs} hr${hrs > 1 ? "s" : ""} ${rem} min`
      : `${hrs} hr${hrs > 1 ? "s" : ""}`;
  }
  // 'minute(s)', 'min(s)'
  if (/(\d+)\s*(minute|min|minutes|mins)/.test(str)) {
    const match = str.match(/(\d+)\s*(minute|min|minutes|mins)/);
    const min = parseInt(match[1], 10);
    if (min < 60) return `${min} min`;
    const hrs = Math.floor(min / 60);
    const rem = min % 60;
    return rem
      ? `${hrs} hr${hrs > 1 ? "s" : ""} ${rem} min`
      : `${hrs} hr${hrs > 1 ? "s" : ""}`;
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
  const queryClient = useQueryClient();
  const courseLayout = course?.courseJson?.course;
  const [openChapter, setOpenChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [addingTopic, setAddingTopic] = useState(null); // chapterIndex where adding new topic
  const [newTopicText, setNewTopicText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [localTopics, setLocalTopics] = useState({});
  const [editingChapter, setEditingChapter] = useState(null);
  const [editedChapterName, setEditedChapterName] = useState("");
  const [addingChapter, setAddingChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const [localChapters, setLocalChapters] = useState([]);

  useEffect(() => {
    if (courseLayout?.chapters) {
      setLocalChapters([...courseLayout.chapters]);

      const topicsMap = {};
      courseLayout.chapters.forEach((chapter, index) => {
        topicsMap[index] = chapter.topics ? [...chapter.topics] : [];
      });

      setLocalTopics(topicsMap);
    }
  }, [courseLayout]);

  // Initialize local topics from course data
  useEffect(() => {
    if (courseLayout?.chapters) {
      const topicsMap = {};
      courseLayout.chapters.forEach((chapter, chapterIndex) => {
        if (chapter.topics) {
          topicsMap[chapterIndex] = [...chapter.topics];
        }
      });
      setLocalTopics(topicsMap);
    }
  }, [courseLayout]);

  // Add loading state when course data is not available
  useEffect(() => {
    if (courseLayout) {
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

  const startEditing = (chapterIndex, topicIndex, currentText) => {
    setEditingTopic({ chapterIndex, topicIndex, originalText: currentText });
    setEditedText(currentText);
  };

  const startEditingChapter = (index, name) => {
    setEditingChapter(index);
    setEditedChapterName(name);
  };

  const saveChapterEdit = (index) => {
    if (!editedChapterName.trim()) {
      toast.error("Chapter name cannot be empty");
      return;
    }

    setLocalChapters((prev) =>
      prev.map((ch, i) =>
        i === index ? { ...ch, chapterName: editedChapterName } : ch,
      ),
    );

    setPendingUpdates((prev) => [
      ...prev,
      {
        chapterIndex: index,
        newChapterName: editedChapterName,
        action: "update-chapter",
      },
    ]);

    setEditingChapter(null);
    toast.success("Chapter updated locally");
  };

  const addNewChapter = () => {
    if (!newChapterName.trim()) {
      toast.error("Chapter name cannot be empty");
      return;
    }

    const newChapter = {
      chapterName: newChapterName,
      duration: "0",
      topics: [],
    };

    setLocalChapters((prev) => [...prev, newChapter]);

    setPendingUpdates((prev) => [
      ...prev,
      {
        chapterIndex: localChapters.length,
        newChapterName,
        action: "add-chapter",
      },
    ]);

    setAddingChapter(false);
    setNewChapterName("");

    toast.success("Chapter added locally");
  };

  const startAdding = (chapterIndex) => {
    setAddingTopic(chapterIndex);
    setNewTopicText("");
  };

  const cancelEditing = () => {
    setEditingTopic(null);
    setEditedText("");
  };

  const cancelAdding = () => {
    setAddingTopic(null);
    setNewTopicText("");
  };

  const saveEdit = (chapterIndex, topicIndex) => {
    if (!editedText.trim()) {
      toast.error("Topic name cannot be empty");
      return;
    }

    if (editedText === editingTopic.originalText) {
      cancelEditing();
      return;
    }

    const update = {
      chapterIndex,
      topicIndex,
      newTopicName: editedText.trim(),
      action: "update",
    };

    setPendingUpdates((prev) => [...prev, update]);

    setLocalTopics((prev) => ({
      ...prev,
      [chapterIndex]: prev[chapterIndex].map((topic, idx) =>
        idx === topicIndex ? editedText.trim() : topic,
      ),
    }));

    toast.success("Edit saved locally. Click 'Finish' to update database.");
    cancelEditing();
  };

  const addNewTopic = (chapterIndex) => {
    if (!newTopicText.trim()) {
      toast.error("Topic name cannot be empty");
      return;
    }

    const newTopicIndex = localTopics[chapterIndex]?.length || 0;
    const update = {
      chapterIndex,
      topicIndex: newTopicIndex,
      newTopicName: newTopicText.trim(),
      action: "add", // New action type
    };

    setPendingUpdates((prev) => [...prev, update]);

    setLocalTopics((prev) => ({
      ...prev,
      [chapterIndex]: [...(prev[chapterIndex] || []), newTopicText.trim()],
    }));

    toast.success(
      "New topic added locally. Click 'Finish' to update database.",
    );
    cancelAdding();
  };

  const deleteTopic = (chapterIndex, topicIndex, topicText) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-lg shadow-lg border flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-800">
          Delete "{topicText}"?
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm bg-gray-100 rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={async (e) => {
              e.stopPropagation();

              toast.dismiss(t.id);

              const deletePromise = axios.put("/api/edit-course", {
                cid: course.cid,
                chapterIndex,
                topicIndex,
                action: "delete",
              });

              toast.promise(deletePromise, {
                loading: "Deleting topic...",
                success: () => {
                  setLocalTopics((prev) => {
                    if (!prev[chapterIndex]) return prev;

                    const updated = [...prev[chapterIndex]];
                    updated.splice(topicIndex, 1);

                    return {
                      ...prev,
                      [chapterIndex]: updated,
                    };
                  });
                  return `"${topicText}" deleted successfully`;
                },
                error: (err) => err.response?.data?.error || "Delete failed",
              });
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const deleteChapter = (chapterIndex, chapterName) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-lg shadow-lg border flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-800">
          Delete chapter "{chapterName}"?
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm bg-gray-100 rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={async (e) => {
              e.stopPropagation();

              toast.dismiss(t.id);

              const deletePromise = axios.put("/api/edit-course", {
                cid: course.cid,
                chapterIndex,
                action: "delete-chapter",
              });

              toast.promise(deletePromise, {
                loading: "Deleting chapter...",
                success: () => {
                  setLocalChapters((prev) =>
                    prev.filter((_, i) => i !== chapterIndex),
                  );

                  setLocalTopics((prev) => {
                    const updated = {};
                    Object.keys(prev).forEach((key) => {
                      const k = Number(key);

                      if (k < chapterIndex) updated[k] = prev[k];
                      else if (k > chapterIndex) updated[k - 1] = prev[k];
                    });

                    return updated;
                  });

                  return `"${chapterName}" deleted successfully`;
                },
                error: (err) => err.response?.data?.error || "Delete failed",
              });
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleFinish = async () => {
    if (pendingUpdates.length === 0) {
      toast.success("No changes to save!");
      return;
    }

    const courseId = course?.cid ?? course?.courses?.cid ?? course?.courseJson?.course?.cid;

    if (!courseId) {
      toast.error("Unable to save: course ID is missing. Refresh the page and try again.");
      return;
    }

    setIsSaving(true);

    try {
      // ✅ Build final course JSON from local state
      const finalLocalState = {
        course: {
          ...courseLayout,
          chapters: localChapters.map((chapter, idx) => ({
            ...chapter,
            topics: localTopics[idx] || [],
          })),
        },
      };

      const payload = {
        cid: courseId,
        updatedCourseJson: finalLocalState,
      };

      console.log("[ChapterTopicList] handleFinish payload:", payload);
      const toastId = toast.loading("Saving all changes...");

      await axios.put("/api/edit-course", payload);

      toast.success("All changes saved successfully!", {
        id: toastId,
      });

      // ✅ Clear pending updates
      setPendingUpdates([]);

      // ✅ Refresh data (VERY IMPORTANT)
      queryClient.invalidateQueries(["courses", "dashboard"]);
      queryClient.invalidateQueries(["course", course.cid]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading spinner while data is loading
  if (isLoading || !courseLayout) {
    return (
      <div className="max-w-full mt-10">
        <h2 className="font-extrabold text-3xl mb-7 text-slate-800 tracking-tight">
          Chapters & Topics
        </h2>
        <div className="flex flex-col items-center justify-center min-h-100 border border-emerald-100 rounded-2xl bg-linear-to-br from-emerald-50/50 to-white">
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
        <div className="flex flex-col items-center justify-center min-h-75 border border-emerald-100 rounded-2xl bg-linear-to-br from-emerald-50/50 to-white p-8">
          <Gift className="w-16 h-16 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">
            No Chapters Yet
          </h3>
          <p className="text-emerald-600 text-center max-w-md">
            This course doesn't have any chapters yet. Click "Generate Content"
            to create chapters and topics for this course.
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

      {/* Pending Updates Indicator */}
      {pendingUpdates.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-amber-800 font-medium">
                {pendingUpdates.length} pending{" "}
                {pendingUpdates.length === 1 ? "change" : "changes"}
              </span>
            </div>
            <span className="text-amber-600 text-sm">
              Click "Finish" below to save all changes
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {localChapters.map((chapter, idx) => (
          <div
            key={idx}
            className="border border-emerald-950 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <div className="w-full flex flex-col items-start p-5 text-emerald-950 font-semibold hover:bg-emerald-50 transition-colors">
              <div className="w-full flex justify-between items-center">
                {/* LEFT SIDE (ONLY THIS TOGGLES CHAPTER) */}
                <div
                  className="text-left flex-1 cursor-pointer"
                  onClick={() => toggleChapter(idx)}
                >
                  {editingChapter === idx ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700">
                        {idx + 1}
                      </span>

                      <input
                        value={editedChapterName}
                        onChange={(e) => setEditedChapterName(e.target.value)}
                        className="border px-2 py-1 rounded-md flex-1"
                      />

                      <button onClick={() => saveChapterEdit(idx)}>
                        <Save size={16} />
                      </button>

                      <button onClick={() => setEditingChapter(null)}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-xl font-bold mb-2 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 mr-3">
                        {idx + 1}
                      </span>
                      {chapter.chapterName}
                    </h2>
                  )}

                  <div className="flex gap-6 text-l text-emerald-800 font-medium">
                    <span className="font-normal">
                      {formatDurationFriendly(chapter.duration)}
                    </span>

                    <span className="font-normal">
                      {(localTopics[idx] ?? chapter.topics ?? []).length} topics
                    </span>
                  </div>
                </div>

                {/* RIGHT SIDE (NO PARENT CLICK IMPACT HERE) */}
                <div className="flex items-center gap-3">
                  {/* EDIT */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingChapter(idx, chapter.chapterName);
                    }}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    <Edit2 size={18} />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("CHAPTER DELETE CLICKED");
                      deleteChapter(idx, chapter.chapterName);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-md"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* TOGGLE ICON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChapter(idx);
                    }}
                    className="text-emerald-600"
                  >
                    {openChapter === idx ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                openChapter === idx
                  ? "max-h-150 p-5 border-t border-emerald-100 overflow-y-auto"
                  : "max-h-0 p-0"
              } bg-slate-50`}
              style={{ minHeight: openChapter === idx ? "100px" : undefined }}
            >
              <ul className="flex flex-col gap-3 mt-1">
                {/* Add Topic Button at the top */}
                <li className="mb-2">
                  <button
                    onClick={() => startAdding(idx)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-3 font-medium transition-colors"
                  >
                    <Plus size={18} />
                    Add New Topic
                  </button>
                </li>

                {/* Adding new topic input */}
                {addingTopic === idx && (
                  <li className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-3 border-2 border-emerald-300 shadow-sm">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-emerald-600 bg-emerald-100 font-bold rounded-full w-8 h-8 flex items-center justify-center text-base">
                        {(localTopics[idx] || []).length + 1}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={newTopicText}
                          onChange={(e) => setNewTopicText(e.target.value)}
                          placeholder="Enter new topic name"
                          className="flex-1 px-3 py-1 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addNewTopic(idx);
                            if (e.key === "Escape") cancelAdding();
                          }}
                        />
                        <button
                          onClick={() => addNewTopic(idx)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                          title="Add topic"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={cancelAdding}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </li>
                )}

                {/* Existing topics */}
                {(localTopics[idx] ?? chapter.topics ?? []).length > 0 ? (
                  (localTopics[idx] || chapter.topics).map(
                    (topic, topicIdx) => (
                      <li
                        key={topicIdx}
                        className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-3 border shadow-sm hover:bg-emerald-50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-emerald-600 bg-emerald-100 font-bold rounded-full w-8 h-8 flex items-center justify-center text-base">
                            {topicIdx + 1}
                          </div>

                          {editingTopic?.chapterIndex === idx &&
                          editingTopic?.topicIndex === topicIdx ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="flex-1 px-3 py-1 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    saveEdit(idx, topicIdx);
                                  if (e.key === "Escape") cancelEditing();
                                }}
                              />
                              <button
                                onClick={() => saveEdit(idx, topicIdx)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                                title="Save"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 text-slate-800 font-semibold">
                              {topic}
                            </div>
                          )}
                        </div>

                        {!(
                          editingTopic?.chapterIndex === idx &&
                          editingTopic?.topicIndex === topicIdx
                        ) && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditing(idx, topicIdx, topic)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit topic"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("DELETE CLICKED");
                                deleteTopic(idx, topicIdx, topic);
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
                              title="Delete topic"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </li>
                    ),
                  )
                ) : (
                  <li className="text-center py-4 text-emerald-600 italic">
                    No topics defined for this chapter. Click "Add New Topic"
                    above.
                  </li>
                )}
              </ul>
              <div className="flex justify-center mt-6">
                <Gift className="text-emerald-500 w-10 h-10 p-2 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        ))}
        <div className="text-center mt-6">
          {addingChapter ? (
            <div className="flex justify-center gap-2">
              <input
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                placeholder="Enter chapter name"
                className="border px-3 py-2 rounded-md"
              />

              <button onClick={addNewChapter}>
                <Save size={18} />
              </button>

              <button onClick={() => setAddingChapter(false)}>
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingChapter(true)}
              className="bg-emerald-100 px-6 py-3 rounded-lg hover:bg-emerald-200"
            >
              + Add Chapter
            </button>
          )}
        </div>
        <button
          onClick={handleFinish}
          disabled={isSaving || pendingUpdates.length === 0}
          className={`mx-auto mt-4 py-3 px-20 rounded-full text-white text-lg font-bold shadow-lg transition-colors ${
            isSaving || pendingUpdates.length === 0
              ? "bg-emerald-400 cursor-not-allowed"
              : "bg-emerald-950 hover:bg-emerald-900"
          }`}
        >
          {isSaving ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </div>
          ) : (
            `Finish${pendingUpdates.length > 0 ? ` (${pendingUpdates.length})` : ""}`
          )}
        </button>
      </div>
    </div>
  );
}

export default ChapterTopicList;
