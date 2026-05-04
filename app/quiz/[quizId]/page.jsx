"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

function QuizPage() {
  const { quizId } = useParams();
  const { user } = useUser();

  const [quiz, setQuiz] = useState(null);
  const [cid, setCid] = useState(null); // 👈 added
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* =========================
     FETCH QUIZ
  ========================= */
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/quiz/get-quiz?quizId=${quizId}`);

        console.log("FULL RESPONSE:", res.data);

        const quizData = res.data.quiz;

        setQuiz(quizData.quizJson);

        // ✅ ALWAYS SAFE
        setCid(res.data.cid || quizData.cid);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  /* =========================
     HANDLE SELECT
  ========================= */
  const handleSelect = (qIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  /* =========================
     HANDLE SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (submitting) return;

    const totalQuestions = quiz?.questions?.length || 0;

    if (Object.keys(answers).length < totalQuestions) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post("/api/quiz/submit-quiz", {
        quizId,
        answers,
        useremail:
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress,
      });

      window.location.href = `/quiz/result/${quizId}`;
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     HANDLE ABORT
  ========================= */
const handleAbort = () => {
  const courseId = cid || quiz?.cid;

  if (!courseId) {
    toast.error("Course not found");
    return;
  }

  toast.warning("Leave quiz?", {
    description: "Your progress will be lost.",
    duration: Infinity, 

    action: {
      label: "Leave",
      onClick: () => {
        window.location.href = `/course/${courseId}`;
      },
    },

    cancel: {
      label: "Stay",
    },
  });
};

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 to-blue-50">
        <div className="flex flex-col items-center gap-6 p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-emerald-100">
          {/* Spinner */}
          <div className="relative">
            <Loader2 className="w-14 h-14 text-emerald-600 animate-spin" />

            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full blur-xl bg-emerald-200 opacity-40"></div>
          </div>

          {/* Text */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-emerald-700">
              Preparing your quiz...
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Hang tight, questions are loading
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================= */
  return (
    <div className="min-h-screen bg-linear-to-br from-green-100 via-emerald-50 to-green-200 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-2">
          {/* 🔥 TOP BAR */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-emerald-700">
              Final Quiz
            </h1>

            {/* ABORT BUTTON */}
            <Button className = "bg-red-700 text-amber-50" variant="outline" onClick={handleAbort}>
              Abort Quiz
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Answer all questions to complete the quiz
          </p>

          {/* PROGRESS */}
          <div className="text-sm text-gray-600">
            Answered{" "}
            <span className="font-semibold text-emerald-700">
              {Object.keys(answers).length}
            </span>{" "}
            / {quiz?.questions?.length}
          </div>
        </div>

        {/* QUESTIONS */}
        {quiz?.questions?.map((q, i) => (
          <div
            key={i}
            className="p-6 border border-emerald-200 rounded-2xl shadow-md bg-white hover:shadow-lg transition"
          >
            <h3 className="font-semibold mb-4 text-lg text-gray-800">
              {i + 1}. {q.question}
            </h3>

            <div className="space-y-3">
              {q.options.map((opt, j) => {
                const isSelected = answers[i] === opt;

                return (
                  <button
                    key={j}
                    onClick={() => handleSelect(i, opt)}
                    className={`w-full text-left p-3 rounded-xl border transition-all
                      ${
                        isSelected
                          ? "bg-green-200 text-emerald-950 border-green-600 shadow"
                          : "bg-green-50 hover:bg-green-100 border-green-200"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* SUBMIT BUTTON */}
        <div className="flex justify-center mt-10">
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              Object.keys(answers).length !== quiz?.questions?.length
            }
            className="px-10 py-4 text-lg rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
