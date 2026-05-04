"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function ResultPage() {
const { quizId } = useParams();
const { user } = useUser();

const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchResult = async () => {
try {
const res = await axios.get(
`/api/quiz/get-result?quizId=${quizId}&useremail=${user?.primaryEmailAddress?.emailAddress}`
);
    setData(res.data);
  } catch (err) {
    toast.error("Failed to load result");
  } finally {
    setLoading(false);
  }
};

if (user) fetchResult();
}, [quizId, user]);

if (loading || !data) {
return ( <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-100 via-green-50 to-lime-100"> <p className="text-emerald-700 font-semibold text-lg animate-pulse">
Loading Result... </p> </div>
);
}

const {
quiz,
latestAttempt,
allAttempts,
stats,
bestAttempt,
improvement,
rank,
totalUsers,
totalAttempts,
cid,
} = data;

return ( <div className="min-h-screen bg-linear-to-br from-emerald-500 via-green-50 to-lime-400 p-6"> <div className="max-w-4xl mx-auto space-y-8">
    {/* SCORE CARD */}
    <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-lg shadow-xl border border-emerald-200 text-center">
      <h1 className="text-3xl font-bold text-emerald-700">
         Quiz Completed
      </h1>

      <p className="mt-5 text-3xl font-extrabold text-emerald-800">
        {latestAttempt.score} / {latestAttempt.total}
      </p>

      <p className="text-lg text-emerald-600">
        {latestAttempt.percentage}%
      </p>

      <p className="text-sm text-gray-500 mt-1">
        Attempts: {totalAttempts}
      </p>

      <p className="mt-4 text-sm font-semibold text-emerald-700">
        🏆 Best Score: {bestAttempt.percentage}%
      </p>

      {improvement > 0 && (
        <p className="text-sm text-green-600 font-semibold">
          📈 Improved by +{improvement}%
        </p>
      )}

      {rank && totalUsers > 1 && (
        <p className="text-sm text-blue-600 font-medium mt-1">
          🏅 Rank: #{rank} / {totalUsers}
        </p>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Avg Score:{" "}
        <span className="font-semibold text-emerald-700">
          {stats.avgScore}%
        </span>{" "}
        • {totalUsers} learners
      </div>
    </div>

    {/* ATTEMPTS */}
    <div className="p-6 bg-white/70 backdrop-blur-lg rounded-2xl border border-emerald-200 shadow">
      <h3 className="font-semibold mb-4 text-emerald-700">
        Your Attempts
      </h3>

      <div className="space-y-3">
        {allAttempts.map((a, i) => (
          <div
            key={i}
            className="flex justify-between px-4 py-3 rounded-lg bg-emerald-50"
          >
            <span>Attempt {i + 1}</span>
            <span className="font-semibold text-emerald-700">
              {a.score}/{a.total} ({a.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* QUESTIONS */}
    {quiz.questions.map((q, i) => {
      const userAnswer = latestAttempt.answers[i];

      return (
        <div
          key={i}
          className="p-6 bg-white border rounded-2xl shadow"
        >
          <h3 className="font-semibold mb-3">
            {i + 1}. {q.question}
          </h3>

          <div className="space-y-2">
            {q.options.map((opt, j) => {
              const isUser = userAnswer === opt;
              const isCorrectOpt = q.correctAnswer === opt;

              return (
                <div
                  key={j}
                  className={`p-3 rounded-lg border
                    ${
                      isCorrectOpt
                        ? "bg-green-100 border-green-400"
                        : isUser
                        ? "bg-red-100 border-red-400"
                        : "bg-gray-50"
                    }`}
                >
                  {opt}
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-sm text-gray-600">
            💡 {q.explanation}
          </p>
        </div>
      );
    })}

    {/* BUTTONS */}
    <div className="flex justify-center gap-4 mt-6">
      <Button
        onClick={() => (window.location.href = `/quiz/${quizId}`)}
      >
        Retake Quiz
      </Button>

      <Button
      className={"bg-emerald-600 text-amber-50 hover:bg-emerald-500 hover:text-amber-50"}
        variant="outline"
        onClick={() => {
          if (!cid) return;
          window.location.href = `/course/${cid}`;
        }}
      >
        Back to Course
      </Button>
    </div>
  </div>
</div>
);
}

export default ResultPage;
