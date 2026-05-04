"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LayoutSelectionPage() {
  const [layouts, setLayouts] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const storedLayouts = sessionStorage.getItem("courseLayouts");
    const storedForm = sessionStorage.getItem("courseFormData");

    if (!storedLayouts || !storedForm) {
      toast.error("No layouts found. Generate again.");
      router.push("/workspace");
      return;
    }

    setLayouts(JSON.parse(storedLayouts));
    setFormData(JSON.parse(storedForm));
  }, []);

  const handleSelectLayout = async (layout) => {
    try {
      setLoading(true);

      const res = await axios.post("/api/save-course", {
        layout,
        formData,
      });

      toast.success("Course created!");

      // clear storage
      sessionStorage.removeItem("courseLayouts");
      sessionStorage.removeItem("courseFormData");

      router.push(`/workspace/edit-course/${res.data.cid}`);
    } catch (err) {
      toast.error("Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  const ChapterItem = ({ chapter, index }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="border rounded-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-200 text-emerald-800 font-bold">
              {index + 1}
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                {chapter.chapterName}
              </p>

              <p className="text-sm text-gray-500">
                {chapter.duration || "1h"} • {chapter.topics.length} topics
              </p>
            </div>
          </div>

          {/* TOGGLE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="text-emerald-600 text-lg"
          >
            {open ? "▲" : "▼"}
          </button>
        </div>

        {/* TOPICS */}
        {open && (
          <div className="p-4 bg-white border-t space-y-2">
            {chapter.topics.map((topic, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">
                  {i + 1}
                </div>

                <p className="text-sm text-gray-700">{topic}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-100 via-green-50 to-lime-100 p-6">
      {" "}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-center">
          Choose Your Course Layout
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-6"
            >
              {/* COURSE HEADER */}
              <h2 className="text-xl font-bold text-emerald-700">
                {layout.data.course.name}
              </h2>

              <p className="text-sm text-gray-600 mt-2">
                {layout.data.course.description}
              </p>

              {/* CHAPTERS */}
              <div className="mt-5 space-y-4">
                {layout.data.course.chapters.map((ch, index) => (
                  <ChapterItem key={index} chapter={ch} index={index} />
                ))}
              </div>

              {/* 🔥 SELECT BUTTON */}
              <button
                disabled={loading}
                onClick={() => {
                  setSelectedId(layout.id);
                  handleSelectLayout(layout.data);
                }}
                className={`mt-6 w-full py-3 rounded-xl font-semibold transition
    ${
      selectedId === layout.id
        ? "bg-emerald-800 text-white"
        : "bg-emerald-600 text-white hover:bg-emerald-700"
    }
  `}
              >
                {loading && selectedId === layout.id
                  ? "Saving..."
                  : "Select This Layout"}
              </button>
            </div>
          ))}
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl px-8 py-6 text-center space-y-4">
              {/* Spinner */}
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

              {/* Text */}
              <p className="text-lg font-semibold text-emerald-700">
                Saving your choice...
              </p>

              <p className="text-xs text-gray-500 mt-2">
                This may take a while...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
