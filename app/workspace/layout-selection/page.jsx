"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import {
  Loader2,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export default function LayoutSelectionPage() {

  const [layouts, setLayouts] =
    useState([]);

  const [formData, setFormData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [
    selectedId,
    setSelectedId,
  ] = useState(null);

  const router =
    useRouter();

  /* =========================================
     LOAD DATA
  ========================================= */

  useEffect(() => {

    const storedLayouts =
      sessionStorage.getItem(
        "courseLayouts"
      );

    const storedForm =
      sessionStorage.getItem(
        "courseFormData"
      );

    if (
      !storedLayouts ||
      !storedForm
    ) {

      toast.error(
        "No layouts found. Generate again."
      );

      router.push(
        "/workspace"
      );

      return;
    }

    setLayouts(
      JSON.parse(
        storedLayouts
      )
    );

    setFormData(
      JSON.parse(
        storedForm
      )
    );
  }, []);

  /* =========================================
     SELECT LAYOUT
  ========================================= */

  const handleSelectLayout =
    async (layout) => {

      try {

        setLoading(true);

        const res =
          await axios.post(
            "/api/save-course",
            {
              layout,
              formData,
            }
          );

        toast.success(
          "Course created!"
        );

        sessionStorage.removeItem(
          "courseLayouts"
        );

        sessionStorage.removeItem(
          "courseFormData"
        );

        router.push(
          `/workspace/edit-course/${res.data.cid}`
        );

      } catch (err) {

        toast.error(
          "Failed to save course"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =========================================
     CHAPTER ITEM
  ========================================= */

  const ChapterItem = ({
    chapter,
    index,
  }) => {

    const [open, setOpen] =
      useState(false);

    return (
      <div
        className="
          overflow-hidden

          rounded-2xl

          border
          border-emerald-100
          dark:border-emerald-500/20

          bg-white
          dark:bg-gray-900

          shadow-sm
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between

            gap-4

            px-4
            py-4

            bg-emerald-50
            dark:bg-emerald-500/5
          "
        >
          <div
            className="
              flex
              items-center

              gap-3

              flex-1
            "
          >
            <div
              className="
                flex
                items-center
                justify-center

                w-9
                h-9

                rounded-full

                bg-emerald-200
                dark:bg-emerald-500/20

                text-emerald-800
                dark:text-emerald-300

                font-bold
              "
            >
              {index + 1}
            </div>

            <div className="min-w-0">

              <p
                className="
                  font-semibold

                  text-gray-800
                  dark:text-gray-200

                  truncate
                "
              >
                {
                  chapter.chapterName
                }
              </p>

              <p
                className="
                  text-sm

                  text-gray-500
                  dark:text-gray-400
                "
              >
                {chapter.duration ||
                  "1h"}{" "}
                •{" "}
                {
                  chapter.topics
                    .length
                }{" "}
                topics
              </p>

            </div>
          </div>

          {/* TOGGLE */}
          <button
            onClick={() =>
              setOpen(!open)
            }
            className="
              p-2

              rounded-xl

              bg-white
              dark:bg-gray-800

              border
              border-emerald-100
              dark:border-emerald-500/10

              text-emerald-700
              dark:text-emerald-300

              transition-all
            "
          >
            {open ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
        </div>

        {/* TOPICS */}
        {open && (
          <div
            className="
              border-t
              border-emerald-100
              dark:border-emerald-500/10

              bg-white
              dark:bg-gray-950

              p-4

              space-y-3
            "
          >
            {chapter.topics.map(
              (
                topic,
                i
              ) => (
                <div
                  key={i}
                  className="
                    flex
                    items-center

                    gap-3

                    rounded-xl

                    bg-gray-50
                    dark:bg-gray-900

                    border
                    border-gray-100
                    dark:border-gray-800

                    px-3
                    py-3
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-center

                      w-7
                      h-7

                      rounded-full

                      bg-emerald-100
                      dark:bg-emerald-500/10

                      text-sm

                      text-emerald-700
                      dark:text-emerald-300
                    "
                  >
                    {i + 1}
                  </div>

                  <p
                    className="
                      text-sm

                      text-gray-700
                      dark:text-gray-300

                      break-words
                    "
                  >
                    {topic}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-emerald-100
        via-green-50
        to-lime-100

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        px-4
        sm:px-6

        py-8
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
        "
      >
        {/* HEADER */}
        <div className="text-center mb-10">

          <div
            className="
              inline-flex
              items-center

              gap-2

              rounded-full

              bg-emerald-100
              dark:bg-emerald-500/10

              px-4
              py-2

              text-sm
              font-semibold

              text-emerald-700
              dark:text-emerald-300

              mb-4
            "
          >
            <Sparkles size={16} />

            AI Generated Layouts
          </div>

          <h1
            className="
              text-3xl
              md:text-5xl

              font-black

              tracking-tight

              text-emerald-800
              dark:text-emerald-300
            "
          >
            Choose Your Course Layout
          </h1>

          <p
            className="
              mt-4

              max-w-2xl
              mx-auto

              text-gray-600
              dark:text-gray-400
            "
          >
            Select the structure that
            best fits your teaching style
            and learning experience.
          </p>
        </div>

        {/* LAYOUTS */}
        <div
          className="
            grid

            grid-cols-1
            lg:grid-cols-2

            gap-7
          "
        >
          {layouts.map(
            (layout) => (
              <div
                key={layout.id}
                className="
                  rounded-3xl

                  border
                  border-emerald-200
                  dark:border-emerald-500/20

                  bg-white/90
                  dark:bg-gray-900/90

                  backdrop-blur-xl

                  shadow-xl

                  p-6

                  transition-all
                  duration-300

                  hover:-translate-y-1
                  hover:shadow-2xl
                "
              >
                {/* TITLE */}
                <div className="flex items-start gap-4">

                  <div
                    className="
                      flex
                      items-center
                      justify-center

                      w-14
                      h-14

                      rounded-2xl

                      bg-emerald-100
                      dark:bg-emerald-500/10

                      shrink-0
                    "
                  >
                    <BookOpen
                      className="
                        h-7
                        w-7

                        text-emerald-700
                        dark:text-emerald-300
                      "
                    />
                  </div>

                  <div className="min-w-0">

                    <h2
                      className="
                        text-2xl

                        font-bold

                        text-emerald-800
                        dark:text-emerald-300
                      "
                    >
                      {
                        layout.data.course
                          .name
                      }
                    </h2>

                    <p
                      className="
                        text-sm

                        text-gray-600
                        dark:text-gray-400

                        mt-2

                        leading-relaxed
                      "
                    >
                      {
                        layout.data.course
                          .description
                      }
                    </p>

                  </div>
                </div>

                {/* CHAPTERS */}
                <div className="mt-6 space-y-4">

                  {layout.data.course.chapters.map(
                    (
                      ch,
                      index
                    ) => (
                      <ChapterItem
                        key={
                          index
                        }
                        chapter={
                          ch
                        }
                        index={
                          index
                        }
                      />
                    )
                  )}

                </div>

                {/* BUTTON */}
                <button
                  disabled={
                    loading
                  }
                  onClick={() => {

                    setSelectedId(
                      layout.id
                    );

                    handleSelectLayout(
                      layout.data
                    );
                  }}
                  className={`
                    mt-7

                    w-full

                    rounded-2xl

                    py-4

                    text-base
                    font-bold

                    transition-all

                    shadow-lg

                    ${
                      selectedId ===
                      layout.id
                        ? "bg-emerald-900 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }
                  `}
                >
                  {loading &&
                  selectedId ===
                    layout.id ? (
                    <div className="flex items-center justify-center gap-3">

                      <Loader2 className="animate-spin h-5 w-5" />

                      Saving...

                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">

                      <CheckCircle2 size={18} />

                      Select This Layout

                    </div>
                  )}
                </button>
              </div>
            )
          )}
        </div>

        {/* LOADING OVERLAY */}
        {loading && (
          <div
            className="
              fixed
              inset-0

              z-50

              flex
              items-center
              justify-center

              bg-black/40

              backdrop-blur-md
            "
          >
            <div
              className="
                rounded-3xl

                bg-white
                dark:bg-gray-900

                px-10
                py-8

                shadow-2xl

                text-center
              "
            >
              <div
                className="
                  w-12
                  h-12

                  mx-auto

                  border-4
                  border-emerald-500
                  border-t-transparent

                  rounded-full

                  animate-spin
                "
              />

              <p
                className="
                  mt-5

                  text-xl
                  font-bold

                  text-emerald-700
                  dark:text-emerald-300
                "
              >
                Saving your choice...
              </p>

              <p
                className="
                  mt-2

                  text-sm

                  text-gray-500
                  dark:text-gray-400
                "
              >
                This may take a few moments
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}