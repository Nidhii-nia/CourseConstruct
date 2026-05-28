"use client";

import React, { useState } from "react";

import axios from "axios";

import {
  Loader2,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function FeedbackDialog({
  onClose,
  courseInfo,
  user,
}) {
  const [rating, setRating] =
    useState(5);

  const [feedback, setFeedback] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit =
    async () => {
      try {
        setLoading(true);

        const cid =
          courseInfo?.cid ||
          courseInfo?.courses
            ?.cid;

        await axios.post(
          "/api/course-feedback",
          {
            cid,

            useremail:
              user
                ?.primaryEmailAddress
                ?.emailAddress,

            rating,

            feedback,
          }
        );

        localStorage.setItem(
          `feedback_${cid}`,
          "done"
        );

        onClose();
      } catch (err) {
        console.error(err);

        alert(
          "Failed to submit feedback"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      className="
        fixed
        inset-0

        z-9999

        bg-black/40

        backdrop-blur-md

        flex
        items-center
        justify-center

        px-4
      "
    >
      {/* DIALOG */}
      <div
        className="
          relative

          w-full
          max-w-md

          rounded-3xl

          overflow-hidden

          bg-white/95
          dark:bg-gray-900/95

          backdrop-blur-xl

          shadow-2xl

          border
          border-emerald-200
          dark:border-emerald-500/20

          animate-in
          fade-in
          zoom-in-95
          duration-300
        "
      >
        {/* TOP GRADIENT */}
        <div
          className="
            h-2

            bg-gradient-to-r
            from-emerald-500
            via-green-400
            to-teal-500
          "
        />

        <div className="p-5 sm:p-6">

          {/* ICON */}
          <div
            className="
w-14
h-14

              rounded-full

              mx-auto
              mb-5

              flex
              items-center
              justify-center

              bg-emerald-100
              dark:bg-emerald-500/20
            "
          >
            <CheckCircle2
              className="
                w-8
                h-8

                text-emerald-600
                dark:text-emerald-300
              "
            />
          </div>

          {/* TITLE */}
          <div className="text-center mb-6">

            <h2
              className="
text-xl
sm:text-2xl

                font-bold

                text-emerald-700
                dark:text-emerald-300
              "
            >
              Course Completed!
            </h2>

            <p
              className="
                text-sm
                sm:text-base

                text-gray-500
                dark:text-gray-400

                mt-2
              "
            >
              We'd love to hear
              about your learning
              experience
            </p>

          </div>

          {/* RATING */}
          <div className="mb-6">

            <p
              className="
                text-sm
                font-medium

                text-gray-700
                dark:text-gray-300

                mb-3
              "
            >
              Your Rating
            </p>

            <div className="flex justify-center gap-3 flex-wrap">

              {[1, 2, 3, 4, 5].map(
                (r) => (
                  <button
                    key={r}
                    onClick={() =>
                      setRating(r)
                    }
                    className={`
                      w-12
                      h-12

                      rounded-2xl

                      flex
                      items-center
                      justify-center

                      transition-all
                      duration-300

                      shadow-sm
                      hover:shadow-lg

                      hover:scale-110

                      ${
                        rating >= r
                          ? `
                            bg-emerald-500

                            text-white

                            shadow-emerald-200
                          `
                          : `
                            bg-gray-100
                            dark:bg-gray-800

                            text-gray-400
                            dark:text-gray-500
                          `
                      }
                    `}
                  >
                    <Star
                      className={`
                        w-5
                        h-5

                        ${
                          rating >= r
                            ? "fill-current"
                            : ""
                        }
                      `}
                    />
                  </button>
                )
              )}

            </div>

            <p
              className="
                text-center

                text-sm

                text-gray-500
                dark:text-gray-400

                mt-3
              "
            >
              {rating === 5 &&
                "Excellent!"}

              {rating === 4 &&
                "Very Good!"}

              {rating === 3 &&
                "Good"}

              {rating === 2 &&
                "Needs Improvement"}

              {rating === 1 &&
                "Poor"}
            </p>

          </div>

          {/* FEEDBACK */}
          <div className="mb-6">

            <label
              className="
                block

                text-sm
                font-medium

                text-gray-700
                dark:text-gray-300

                mb-2
              "
            >
              Feedback
            </label>

            <textarea
              placeholder="Write your feedback..."
              value={feedback}
              onChange={(e) =>
                setFeedback(
                  e.target.value
                )
              }
              rows={4}
              className="
                w-full

                rounded-2xl

                border
                border-gray-200
                dark:border-gray-700

                bg-white
                dark:bg-gray-800

                text-gray-800
                dark:text-white

                placeholder:text-gray-400
                dark:placeholder:text-gray-500

                px-4
                py-3

                outline-none

                focus:ring-2
                focus:ring-emerald-500

                transition-all

                resize-none
              "
            />
          </div>

          {/* ACTIONS */}
          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row

              gap-3

              justify-end
            "
          >
            {/* SKIP */}
            <button
              onClick={() => {
                const cid =
                  courseInfo?.cid ||
                  courseInfo?.courses
                    ?.cid;

                localStorage.setItem(
                  `feedback_${cid}`,
                  "done"
                );

                onClose();
              }}
              className="
                px-5
                py-3

                rounded-2xl

                border
                border-gray-200
                dark:border-gray-700

                bg-white
                dark:bg-gray-800

                text-gray-700
                dark:text-gray-300

                hover:bg-gray-50
                dark:hover:bg-gray-700

                transition-all
              "
            >
              Skip
            </button>

            {/* SUBMIT */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="
                px-5
                py-3

                rounded-2xl

                bg-emerald-600
                hover:bg-emerald-700

                disabled:opacity-60

                text-white

                font-medium

                shadow-lg
                hover:shadow-xl

                transition-all
                duration-300
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />

                  Submitting...
                </span>
              ) : (
                "Submit Feedback"
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}