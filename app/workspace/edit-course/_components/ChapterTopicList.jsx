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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* =========================================
   FRIENDLY DURATION
========================================= */

function formatDurationFriendly(raw) {
  if (!raw) return "N/A";

  let str = String(raw).toLowerCase().trim();

  if (/^\d+$/.test(str)) {
    const min = parseInt(str, 10);

    if (min < 60) return `${min} min`;

    const hrs = Math.floor(min / 60);

    const rem = min % 60;

    return rem
      ? `${hrs} hr${hrs > 1 ? "s" : ""} ${rem} min`
      : `${hrs} hr${hrs > 1 ? "s" : ""}`;
  }

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

  return raw;
}

function ChapterTopicList({ course }) {
  const queryClient = useQueryClient();

  const courseLayout = course?.courseJson?.course || {};

  const [openChapter, setOpenChapter] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [editingTopic, setEditingTopic] = useState(null);

  const [editedText, setEditedText] = useState("");

  const [addingTopic, setAddingTopic] = useState(null);

  const [newTopicText, setNewTopicText] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [pendingUpdates, setPendingUpdates] = useState([]);

  const [localTopics, setLocalTopics] = useState({});

  const [editingChapter, setEditingChapter] = useState(null);

  const [editedChapterName, setEditedChapterName] = useState("");

  const [addingChapter, setAddingChapter] = useState(false);

  const [newChapterName, setNewChapterName] = useState("");

  const [localChapters, setLocalChapters] = useState([]);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* =========================================
     INITIALIZE
  ========================================= */

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

  /* =========================================
     TOGGLE
  ========================================= */

  const toggleChapter = (index) => {
    setOpenChapter(openChapter === index ? null : index);
  };

  /* =========================================
     EDIT TOPIC
  ========================================= */

  const startEditing = (chapterIndex, topicIndex, currentText) => {
    setEditingTopic({
      chapterIndex,
      topicIndex,
      originalText: currentText,
    });

    setEditedText(currentText);
  };

  const cancelEditing = () => {
    setEditingTopic(null);

    setEditedText("");
  };

  const saveEdit = (chapterIndex, topicIndex) => {
    if (!editedText.trim()) {
      toast.error("Topic name cannot be empty");

      return;
    }

    setLocalTopics((prev) => ({
      ...prev,

      [chapterIndex]: prev[chapterIndex].map((topic, idx) =>
        idx === topicIndex ? editedText.trim() : topic,
      ),
    }));

    setPendingUpdates((prev) => [
      ...prev,
      {
        chapterIndex,
        topicIndex,
        newTopicName: editedText.trim(),
        action: "update",
      },
    ]);

    toast.success("Topic updated locally");

    cancelEditing();
  };

  /* =========================================
     ADD TOPIC
  ========================================= */

  const startAdding = (chapterIndex) => {
    setAddingTopic(chapterIndex);

    setNewTopicText("");
  };

  const cancelAdding = () => {
    setAddingTopic(null);

    setNewTopicText("");
  };

  const addNewTopic = (chapterIndex) => {
    if (!newTopicText.trim()) {
      toast.error("Topic name cannot be empty");

      return;
    }

    setLocalTopics((prev) => ({
      ...prev,

      [chapterIndex]: [...(prev[chapterIndex] || []), newTopicText.trim()],
    }));

    setPendingUpdates((prev) => [
      ...prev,
      {
        chapterIndex,
        topicIndex: localTopics[chapterIndex]?.length || 0,
        newTopicName: newTopicText.trim(),
        action: "add",
      },
    ]);

    toast.success("Topic added locally");

    cancelAdding();
  };

  /* =========================================
     SAVE ALL
  ========================================= */

  const handleFinish = async () => {
    if (pendingUpdates.length === 0) {
      toast.success("No changes to save!");

      return;
    }

    setIsSaving(true);

    try {
      const finalLocalState = {
        course: {
          ...courseLayout,

          chapters: localChapters.map((chapter, idx) => ({
            ...chapter,

            topics: localTopics[idx] || [],
          })),
        },
      };

      await axios.put("/api/edit-course", {
        cid: course.cid,

        updatedCourseJson: finalLocalState,
      });

      toast.success("Changes saved successfully!");

      setPendingUpdates([]);

      queryClient.invalidateQueries(["courses", "dashboard"]);
    } catch (error) {
      console.error(error);

      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================
     LOADING
  ========================================= */

  if (isLoading || !courseLayout) {
    return (
      <div className="max-w-full mt-10">
        <h2
          className="
            text-3xl
            font-black

            mb-8

            text-emerald-900
            dark:text-emerald-300
          "
        >
          Chapters & Topics
        </h2>

        <div
          className="
            flex
            flex-col
            items-center
            justify-center

            min-h-[400px]

            rounded-3xl

            border
            border-emerald-200
            dark:border-emerald-500/20

            bg-linear-to-br
            from-emerald-50
            to-white

            dark:from-gray-900
            dark:to-gray-950

            shadow-xl
          "
        >
          <Loader2
            className="
              h-12
              w-12

              animate-spin

              text-emerald-600
            "
          />

          <p
            className="
              mt-5

              text-lg

              text-emerald-700
              dark:text-emerald-300
            "
          >
            Loading chapters...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN
  ========================================= */

  return (
    <div className="max-w-full mt-10">
      {/* HEADER */}
      <div
        className="
          flex
          flex-col
          md:flex-row

          md:items-center
          md:justify-between

          gap-4

          mb-8
        "
      >
        <h2
          className="
            text-3xl
            font-black

            text-emerald-900
            dark:text-emerald-300
          "
        >
          Chapters & Topics ({localChapters.length})
        </h2>

        {pendingUpdates.length > 0 && (
          <div
            className="
              px-4
              py-2

              rounded-full

              bg-amber-100
              dark:bg-amber-500/10

              border
              border-amber-200
              dark:border-amber-500/20

              text-amber-800
              dark:text-amber-300

              text-sm
              font-semibold
            "
          >
            {pendingUpdates.length} pending changes
          </div>
        )}
      </div>

      {/* CHAPTERS */}
      <div className="space-y-6">
        {localChapters.map((chapter, idx) => (
          <div
            key={idx}
            className="
                overflow-hidden

                rounded-3xl

                border
                border-emerald-200
                dark:border-emerald-500/20

                bg-white
                dark:bg-gray-900

                shadow-lg

                transition-all
              "
          >
            {/* HEADER */}
            <div
              className="
                  flex
                  items-center
                  justify-between

                  gap-4

                  p-5

                  bg-gradient-to-r
                  from-emerald-50
                  to-white

                  dark:from-gray-900
                  dark:to-gray-950
                "
            >
              <div className="flex items-center justify-between flex-1 gap-4">
                {/* LEFT */}
                <div
                  className="
      flex-1

      cursor-pointer
    "
                  onClick={() => toggleChapter(idx)}
                >
                  {editingChapter === idx ? (
                    <div className="flex flex-col gap-3">
                      <input
                        value={editedChapterName}
                        onChange={(e) => setEditedChapterName(e.target.value)}
                        className="
            w-full

            rounded-2xl

            border
            border-emerald-300

            bg-white
            dark:bg-gray-950

            px-4
            py-3

            text-lg
            font-bold

            outline-none

            focus:ring-2
            focus:ring-emerald-500

            dark:text-white
          "
                      />

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            if (!editedChapterName.trim()) {
                              toast.error("Chapter name cannot be empty");
                              return;
                            }

                            setLocalChapters((prev) =>
                              prev.map((ch, i) =>
                                i === idx
                                  ? {
                                      ...ch,
                                      chapterName: editedChapterName.trim(),
                                    }
                                  : ch,
                              ),
                            );

                            setPendingUpdates((prev) => [
                              ...prev,
                              {
                                chapterIndex: idx,
                                action: "chapter-update",
                                chapterName: editedChapterName.trim(),
                              },
                            ]);

                            setEditingChapter(null);

                            setEditedChapterName("");

                            toast.success("Chapter updated locally");
                          }}
                          className="
              p-2

              rounded-xl

              bg-emerald-100
              dark:bg-emerald-500/10

              text-emerald-700
              dark:text-emerald-300
            "
                        >
                          <Save size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            setEditingChapter(null);

                            setEditedChapterName("");
                          }}
                          className="
              p-2

              rounded-xl

              bg-red-100
              dark:bg-red-500/10

              text-red-600
              dark:text-red-300
            "
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3
                        className="
            text-xl
            font-bold

            text-emerald-900
            dark:text-emerald-300
          "
                      >
                        {idx + 1}. {chapter.chapterName}
                      </h3>

                      <p
                        className="
            mt-1

            text-sm

            text-gray-500
            dark:text-gray-400
          "
                      >
                        {formatDurationFriendly(chapter.duration)} •{" "}
                        {(localTopics[idx] || []).length} topics
                      </p>
                    </>
                  )}
                </div>

                {/* CHAPTER ACTIONS */}
                {editingChapter !== idx && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setEditingChapter(idx);

                        setEditedChapterName(chapter.chapterName);
                      }}
                      className="
          p-2

          rounded-xl

          bg-slate-100
          dark:bg-gray-800

          text-slate-700
          dark:text-gray-300
        "
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setDeleteConfirm({
                          type: "chapter",
                          chapterIndex: idx,
                        });
                      }}
                      className="
          p-2

          rounded-xl

          bg-red-100
          dark:bg-red-500/10

          text-red-600
          dark:text-red-300
        "
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => toggleChapter(idx)}
                className="
                    p-2

                    rounded-xl

                    bg-emerald-100
                    dark:bg-emerald-500/10

                    text-emerald-700
                    dark:text-emerald-300
                  "
              >
                {openChapter === idx ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>

            {/* CONTENT */}
            {openChapter === idx && (
              <div
                className="
                    border-t
                    border-emerald-100
                    dark:border-emerald-500/10

                    p-5

                    bg-slate-50
                    dark:bg-gray-950
                  "
              >
                {/* ADD TOPIC */}
                <button
                  onClick={() => startAdding(idx)}
                  className="
                      w-full

                      flex
                      items-center
                      justify-center

                      gap-2

                      rounded-2xl

                      border-2
                      border-dashed
                      border-emerald-300

                      bg-emerald-50
                      dark:bg-emerald-500/5

                      py-4

                      text-emerald-700
                      dark:text-emerald-300

                      font-semibold

                      hover:bg-emerald-100
                      dark:hover:bg-emerald-500/10

                      transition-all
                    "
                >
                  <Plus size={18} />
                  Add New Topic
                </button>

                {/* TOPICS */}
                <ul className="space-y-3 mt-5">
                  {(localTopics[idx] || []).map((topic, topicIdx) => (
                    <li
                      key={topicIdx}
                      className="
                            flex
                            items-center
                            justify-between

                            gap-3

                            rounded-2xl

                            border
                            border-emerald-100
                            dark:border-emerald-500/10

                            bg-white
                            dark:bg-gray-900

                            px-4
                            py-3

                            shadow-sm
                          "
                    >
                      {/* TOPIC */}
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="
                                w-8
                                h-8

                                rounded-full

                                bg-emerald-100
                                dark:bg-emerald-500/10

                                flex
                                items-center
                                justify-center

                                text-sm
                                font-bold

                                text-emerald-700
                                dark:text-emerald-300
                              "
                        >
                          {topicIdx + 1}
                        </div>

                        {editingTopic?.chapterIndex === idx &&
                        editingTopic?.topicIndex === topicIdx ? (
                          <input
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="
                                  flex-1

                                  rounded-xl

                                  border
                                  border-emerald-300

                                  bg-white
                                  dark:bg-gray-950

                                  px-4
                                  py-2

                                  outline-none

                                  focus:ring-2
                                  focus:ring-emerald-500

                                  dark:text-white
                                "
                          />
                        ) : (
                          <span
                            className="
                                  font-medium

                                  text-gray-800
                                  dark:text-gray-200
                                "
                          >
                            {topic}
                          </span>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2">
                        {editingTopic?.chapterIndex === idx &&
                        editingTopic?.topicIndex === topicIdx ? (
                          <>
                            <button
                              onClick={() => saveEdit(idx, topicIdx)}
                              className="
                                    p-2

                                    rounded-lg

                                    bg-emerald-100
                                    dark:bg-emerald-500/10

                                    text-emerald-700
                                    dark:text-emerald-300
                                  "
                            >
                              <Save size={16} />
                            </button>

                            <button
                              onClick={cancelEditing}
                              className="
                                    p-2

                                    rounded-lg

                                    bg-red-100
                                    dark:bg-red-500/10

                                    text-red-600
                                    dark:text-red-300
                                  "
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(idx, topicIdx, topic)}
                              className="
                                    p-2

                                    rounded-lg

                                    bg-slate-100
                                    dark:bg-gray-800

                                    text-slate-700
                                    dark:text-gray-300
                                  "
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              className="
                                    p-2

                                    rounded-lg

                                    bg-red-100
                                    dark:bg-red-500/10

                                    text-red-600
                                    dark:text-red-300
                                  "
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* ADD INPUT */}
                {addingTopic === idx && (
                  <div
                    className="
                        mt-4

                        flex
                        flex-col
                        sm:flex-row

                        gap-3
                      "
                  >
                    <input
                      value={newTopicText}
                      onChange={(e) => setNewTopicText(e.target.value)}
                      placeholder="Enter topic name"
                      className="
                          flex-1

                          rounded-2xl

                          border
                          border-emerald-300

                          bg-white
                          dark:bg-gray-900

                          px-4
                          py-3

                          outline-none

                          focus:ring-2
                          focus:ring-emerald-500

                          dark:text-white
                        "
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => addNewTopic(idx)}
                        className="
                            px-5
                            py-3

                            rounded-2xl

                            bg-emerald-600
                            hover:bg-emerald-700

                            text-white

                            font-semibold
                          "
                      >
                        Save
                      </button>

                      <button
                        onClick={cancelAdding}
                        className="
                            px-5
                            py-3

                            rounded-2xl

                            bg-red-100
                            dark:bg-red-500/10

                            text-red-600
                            dark:text-red-300

                            font-semibold
                          "
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD CHAPTER */}
<div className="flex justify-center mt-10">
  {addingChapter ? (
    <div
      className="
        w-full
        max-w-2xl

        rounded-3xl

        border
        border-emerald-200
        dark:border-emerald-500/20

        bg-white
        dark:bg-gray-900

        p-5

        shadow-lg
      "
    >
      <div className="flex flex-col gap-4">
        <input
          value={newChapterName}
          onChange={(e) =>
            setNewChapterName(e.target.value)
          }
          placeholder="Enter chapter name"
          className="
            w-full

            rounded-2xl

            border
            border-emerald-300

            bg-white
            dark:bg-gray-950

            px-4
            py-3

            outline-none

            focus:ring-2
            focus:ring-emerald-500

            dark:text-white
          "
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              if (!newChapterName.trim()) {
                toast.error(
                  "Chapter name cannot be empty",
                );

                return;
              }

              const newChapter = {
                chapterName:
                  newChapterName.trim(),

                duration: "30 mins",

                topics: [],
              };

              setLocalChapters((prev) => [
                ...prev,
                newChapter,
              ]);

              setLocalTopics((prev) => ({
                ...prev,

                [localChapters.length]: [],
              }));

              setPendingUpdates((prev) => [
                ...prev,
                {
                  action: "chapter-add",
                  chapterName:
                    newChapterName.trim(),
                },
              ]);

              setAddingChapter(false);

              setNewChapterName("");

              toast.success(
                "Chapter added locally",
              );
            }}
            className="
              px-5
              py-3

              rounded-2xl

              bg-emerald-600
              hover:bg-emerald-700

              text-white

              font-semibold
            "
          >
            Save Chapter
          </button>

          <button
            onClick={() => {
              setAddingChapter(false);

              setNewChapterName("");
            }}
            className="
              px-5
              py-3

              rounded-2xl

              bg-red-100
              dark:bg-red-500/10

              text-red-600
              dark:text-red-300

              font-semibold
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : (
    <button
      onClick={() => setAddingChapter(true)}
      className="
        flex
        items-center
        gap-3

        rounded-full

        bg-emerald-600
        hover:bg-emerald-700

        px-6
        py-4

        text-white

        font-bold

        shadow-lg

        transition-all
      "
    >
      <Plus size={20} />
      Add New Chapter
    </button>
  )}
</div>

      {/* SAVE */}
      <div className="flex justify-center mt-10">
        <button
          onClick={handleFinish}
          disabled={isSaving || pendingUpdates.length === 0}
          className={`
            min-w-[240px]

            rounded-full

            px-8
            py-4

            text-lg
            font-bold

            shadow-xl

            transition-all

            ${
              isSaving || pendingUpdates.length === 0
                ? "bg-emerald-400 cursor-not-allowed text-white"
                : "bg-emerald-950 hover:bg-emerald-900 text-white"
            }
          `}
        >
          {isSaving ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin w-5 h-5" />
              Saving...
            </div>
          ) : (
            `Finish ${
              pendingUpdates.length > 0 ? `(${pendingUpdates.length})` : ""
            }`
          )}
        </button>
      </div>

      {/* DELETE DIALOG */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent
          className="
            rounded-3xl

            bg-white
            dark:bg-gray-900

            border
            border-red-100
            dark:border-red-500/20
          "
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="
                text-red-600
                dark:text-red-300
              "
            >
              Confirm Delete
            </AlertDialogTitle>

            <AlertDialogDescription
              className="
                text-gray-600
                dark:text-gray-400
              "
            >
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="
                bg-red-500
                hover:bg-red-600
              "
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChapterTopicList;
