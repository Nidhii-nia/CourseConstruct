"use client";

import { Gift, ChevronDown, ChevronUp, Loader2, Edit2, Trash2, Save, X, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
  const [editingTopic, setEditingTopic] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [addingTopic, setAddingTopic] = useState(null); // chapterIndex where adding new topic
  const [newTopicText, setNewTopicText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [localTopics, setLocalTopics] = useState({});

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
      action: 'update'
    };
    
    setPendingUpdates(prev => [...prev, update]);
    
    setLocalTopics(prev => ({
      ...prev,
      [chapterIndex]: prev[chapterIndex].map((topic, idx) => 
        idx === topicIndex ? editedText.trim() : topic
      )
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
      action: 'add' // New action type
    };
    
    setPendingUpdates(prev => [...prev, update]);
    
    setLocalTopics(prev => ({
      ...prev,
      [chapterIndex]: [...(prev[chapterIndex] || []), newTopicText.trim()]
    }));
    
    toast.success("New topic added locally. Click 'Finish' to update database.");
    cancelAdding();
  };

  const deleteTopic = async (chapterIndex, topicIndex, topicText) => {
    // Replace confirm with toast dialog
    toast.custom((t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="shrink-0 pt-0.5">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Delete Topic
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete "{topicText}"?
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(chapterIndex, topicIndex, topicText);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-rose-600 hover:text-rose-500 focus:outline-none"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
    });
  };

  const performDelete = async (chapterIndex, topicIndex, topicText) => {
    try {
      const deletePromise = axios.put('/api/edit-course', {
        cid: course.cid,
        chapterIndex,
        topicIndex,
        action: 'delete'
      });

      toast.promise(deletePromise, {
        loading: 'Deleting topic...',
        success: (res) => {
          // Update local state instantly
          setLocalTopics(prev => ({
            ...prev,
            [chapterIndex]: prev[chapterIndex].filter((_, idx) => idx !== topicIndex)
          }));

          // Remove any pending updates for this topic
          setPendingUpdates(prev => 
            prev.filter(update => 
              !(update.chapterIndex === chapterIndex && update.topicIndex === topicIndex)
            )
          );

          return `"${topicText}" deleted successfully!`;
        },
        error: (err) => {
          return err.response?.data?.error || 'Failed to delete topic';
        }
      });

    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleFinish = async () => {
    if (pendingUpdates.length === 0) {
      toast.success("No changes to save!");
      return;
    }

    setIsSaving(true);
    
    try {
      const updatesByChapter = {};
      pendingUpdates.forEach(update => {
        if (!updatesByChapter[update.chapterIndex]) {
          updatesByChapter[update.chapterIndex] = [];
        }
        updatesByChapter[update.chapterIndex].push(update);
      });

      // Create an array of all update promises
      const updatePromises = [];
      
      for (const chapterIndex in updatesByChapter) {
        const chapterUpdates = updatesByChapter[chapterIndex];
        
        for (const update of chapterUpdates) {
          updatePromises.push(
            axios.put('/api/edit-course', {
              cid: course.cid,
              chapterIndex: update.chapterIndex,
              topicIndex: update.topicIndex,
              newTopicName: update.newTopicName,
              action: update.action
            })
          );
        }
      }

      // Show loading toast
      const toastId = toast.loading(`Saving ${pendingUpdates.length} updates...`);

      // Execute all updates
      const results = await Promise.all(updatePromises);

      // Clear pending updates
      setPendingUpdates([]);
      
      toast.success(`Successfully saved ${results.length} updates!`, { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save updates");
      console.error("Finish error:", error);
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
      
      {/* Pending Updates Indicator */}
      {pendingUpdates.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-amber-800 font-medium">
                {pendingUpdates.length} pending {pendingUpdates.length === 1 ? 'change' : 'changes'} 
              </span>
            </div>
            <span className="text-amber-600 text-sm">
              Click "Finish" below to save all changes
            </span>
          </div>
        </div>
      )}

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
                      <span className="font-normal">
                        {(localTopics[idx] || chapter.topics || []).length} topics
                      </span>
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
                            if (e.key === 'Enter') addNewTopic(idx);
                            if (e.key === 'Escape') cancelAdding();
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
                {(localTopics[idx] || chapter.topics || []).length > 0 ? (
                  (localTopics[idx] || chapter.topics).map((topic, topicIdx) => (
                    <li
                      key={topicIdx}
                      className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-3 border shadow-sm hover:bg-emerald-50 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-emerald-600 bg-emerald-100 font-bold rounded-full w-8 h-8 flex items-center justify-center text-base">
                          {topicIdx + 1}
                        </div>
                        
                        {editingTopic?.chapterIndex === idx && editingTopic?.topicIndex === topicIdx ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className="flex-1 px-3 py-1 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(idx, topicIdx);
                                if (e.key === 'Escape') cancelEditing();
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
                          <div className="flex-1 text-slate-800 font-semibold">{topic}</div>
                        )}
                      </div>
                      
                      {!(editingTopic?.chapterIndex === idx && editingTopic?.topicIndex === topicIdx) && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(idx, topicIdx, topic)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit topic"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteTopic(idx, topicIdx, topic)}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
                            title="Delete topic"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-center py-4 text-emerald-600 italic">
                    No topics defined for this chapter. Click "Add New Topic" above.
                  </li>
                )}
              </ul>
              <div className="flex justify-center mt-6">
                <Gift className="text-emerald-500 w-10 h-10 p-2 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={handleFinish}
          disabled={isSaving || pendingUpdates.length === 0}
          className={`mx-auto mt-4 py-3 px-20 rounded-full text-white text-lg font-bold shadow-lg transition-colors ${
            isSaving || pendingUpdates.length === 0
              ? 'bg-emerald-400 cursor-not-allowed'
              : 'bg-emerald-950 hover:bg-emerald-900'
          }`}
        >
          {isSaving ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </div>
          ) : (
            `Finish${pendingUpdates.length > 0 ? ` (${pendingUpdates.length})` : ''}`
          )}
        </button>
      </div>
    </div>
  );
}

export default ChapterTopicList;