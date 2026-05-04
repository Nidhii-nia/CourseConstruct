"use client";
import React, { useState } from "react";
import axios from "axios";

export default function FeedbackDialog({ onClose, courseInfo, user }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const cid = courseInfo?.cid || courseInfo?.courses?.cid;

      await axios.post("/api/course-feedback", {
        cid,
        useremail: user?.primaryEmailAddress?.emailAddress,
        rating,
        feedback,
      });
      localStorage.setItem(`feedback_${cid}`, "done");

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-100 shadow-xl">
        <h2 className="text-xl font-bold text-emerald-700 mb-3">
           Course Completed!
        </h2>

        <p className="text-sm text-gray-600 mb-4">How was your experience?</p>

        {/* Rating */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => setRating(r)}
              className={`w-8 h-8 rounded-full ${
                rating >= r ? "bg-emerald-500 text-white" : "bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Feedback */}
        <textarea
          placeholder="Write your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border p-2 rounded-lg mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              const cid = courseInfo?.cid || courseInfo?.courses?.cid;
              localStorage.setItem(`feedback_${cid}`, "done");
              onClose();
            }}
            className="px-3 py-2 border rounded-lg"
          >
            Skip
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
