"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import { useParams } from "next/navigation";

import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import {
  Loader2,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  TrendingUp,
  Medal,
} from "lucide-react";

function ResultPage() {
  const { quizId } =
    useParams();

  const { user } =
    useUser();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* =========================
     FETCH RESULT
  ========================= */

  useEffect(() => {
    const fetchResult =
      async () => {
        try {
          const res =
            await axios.get(
              `/api/quiz/get-result?quizId=${quizId}&useremail=${user?.primaryEmailAddress?.emailAddress}`
            );

          setData(res.data);
        } catch (err) {
          toast.error(
            "Failed to load result"
          );
        } finally {
          setLoading(false);
        }
      };

    if (user) fetchResult();
  }, [quizId, user]);

  /* =========================
     LOADING
  ========================= */

  if (loading || !data) {
    return (
      <div
        className="
          min-h-screen

          flex
          items-center
          justify-center

          px-4

          bg-linear-to-br
          from-emerald-100
          via-green-50
          to-lime-100

          dark:from-gray-950
          dark:via-gray-900
          dark:to-emerald-950
        "
      >
        <div
          className="
            flex
            flex-col
            items-center

            gap-6

            p-8
            sm:p-10

            rounded-3xl

            bg-white/90
            dark:bg-gray-900/80

            backdrop-blur-xl

            shadow-2xl

            border
            border-emerald-100
            dark:border-emerald-500/20
          "
        >
          <Loader2
            className="
              w-14
              h-14

              text-emerald-600
              dark:text-emerald-300

              animate-spin
            "
          />

          <div className="text-center">

            <h2
              className="
                text-xl
                font-bold

                text-emerald-700
                dark:text-emerald-300
              "
            >
              Loading Result...
            </h2>

            <p
              className="
                text-sm

                text-gray-500
                dark:text-gray-400

                mt-2
              "
            >
              Fetching your quiz
              performance
            </p>

          </div>

          <div className="flex gap-2">

            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>

            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></span>

            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></span>

          </div>
        </div>
      </div>
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

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div
      className="
        min-h-screen

        bg-linear-to-br
        from-emerald-500
        via-green-50
        to-lime-300

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        transition-colors
        duration-500

        px-4
        sm:px-6
        lg:px-8

        py-6
      "
    >
      <div
        className="
          max-w-5xl

          mx-auto

          space-y-8
        "
      >
        {/* SCORE CARD */}
        <div
          className="
            p-6
            sm:p-8

            rounded-3xl

            bg-white/85
            dark:bg-gray-900/80

            backdrop-blur-xl

            shadow-2xl

            border
            border-emerald-200
            dark:border-emerald-500/20

            text-center
          "
        >
          {/* ICON */}
          <div
            className="
              w-20
              h-20

              mx-auto
              mb-5

              rounded-full

              flex
              items-center
              justify-center

              bg-emerald-100
              dark:bg-emerald-500/20
            "
          >
            <Trophy
              className="
                w-10
                h-10

                text-emerald-600
                dark:text-emerald-300
              "
            />
          </div>

          <h1
            className="
              text-3xl
              sm:text-4xl

              font-black

              text-emerald-700
              dark:text-emerald-300
            "
          >
            Quiz Completed
          </h1>

          {/* SCORE */}
          <p
            className="
              mt-6

              text-5xl
              sm:text-6xl

              font-black

              text-emerald-800
              dark:text-emerald-200
            "
          >
            {latestAttempt.score}
            <span
              className="
                text-2xl
                sm:text-3xl

                text-emerald-500
                dark:text-emerald-400
              "
            >
              {" "}
              /{" "}
              {
                latestAttempt.total
              }
            </span>
          </p>

          <p
            className="
              text-xl

              font-semibold

              text-emerald-600
              dark:text-emerald-300

              mt-3
            "
          >
            {
              latestAttempt.percentage
            }
            %
          </p>

          {/* STATS */}
          <div
            className="
              mt-8

              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4

              gap-4
            "
          >
            {/* ATTEMPTS */}
            <div
              className="
                p-4

                rounded-2xl

                bg-emerald-50
                dark:bg-emerald-500/10

                border
                border-emerald-100
                dark:border-emerald-500/20
              "
            >
              <p
                className="
                  text-sm

                  text-gray-500
                  dark:text-gray-400
                "
              >
                Attempts
              </p>

              <p
                className="
                  text-2xl
                  font-bold

                  text-emerald-700
                  dark:text-emerald-300
                "
              >
                {totalAttempts}
              </p>
            </div>

            {/* BEST */}
            <div
              className="
                p-4

                rounded-2xl

                bg-yellow-50
                dark:bg-yellow-500/10

                border
                border-yellow-100
                dark:border-yellow-500/20
              "
            >
              <p
                className="
                  text-sm

                  text-gray-500
                  dark:text-gray-400
                "
              >
                Best Score
              </p>

              <p
                className="
                  text-2xl
                  font-bold

                  text-yellow-700
                  dark:text-yellow-300
                "
              >
                {
                  bestAttempt.percentage
                }
                %
              </p>
            </div>

            {/* IMPROVEMENT */}
            <div
              className="
                p-4

                rounded-2xl

                bg-blue-50
                dark:bg-blue-500/10

                border
                border-blue-100
                dark:border-blue-500/20
              "
            >
              <p
                className="
                  text-sm

                  text-gray-500
                  dark:text-gray-400
                "
              >
                Improvement
              </p>

              <p
                className="
                  text-2xl
                  font-bold

                  text-blue-700
                  dark:text-blue-300
                "
              >
                +{improvement}%
              </p>
            </div>

            {/* RANK */}
            <div
              className="
                p-4

                rounded-2xl

                bg-purple-50
                dark:bg-purple-500/10

                border
                border-purple-100
                dark:border-purple-500/20
              "
            >
              <p
                className="
                  text-sm

                  text-gray-500
                  dark:text-gray-400
                "
              >
                Rank
              </p>

              <p
                className="
                  text-2xl
                  font-bold

                  text-purple-700
                  dark:text-purple-300
                "
              >
                #{rank}
              </p>
            </div>
          </div>

          {/* EXTRA */}
          <div
            className="
              mt-6

              flex
              flex-wrap

              justify-center

              gap-3
            "
          >
            <div
              className="
                flex
                items-center

                gap-2

                px-4
                py-2

                rounded-full

                bg-emerald-100
                dark:bg-emerald-500/10

                text-emerald-700
                dark:text-emerald-300

                text-sm
              "
            >
              <TrendingUp className="w-4 h-4" />

              Avg Score:
              {stats.avgScore}%
            </div>

            <div
              className="
                flex
                items-center

                gap-2

                px-4
                py-2

                rounded-full

                bg-blue-100
                dark:bg-blue-500/10

                text-blue-700
                dark:text-blue-300

                text-sm
              "
            >
              <Medal className="w-4 h-4" />

              {totalUsers} learners
            </div>
          </div>
        </div>

        {/* ATTEMPTS */}
        <div
          className="
            p-6

            rounded-3xl

            bg-white/85
            dark:bg-gray-900/80

            backdrop-blur-xl

            shadow-xl

            border
            border-emerald-200
            dark:border-emerald-500/20
          "
        >
          <h3
            className="
              text-2xl
              font-bold

              mb-5

              text-emerald-700
              dark:text-emerald-300
            "
          >
            Your Attempts
          </h3>

          <div className="space-y-3">

            {allAttempts.map(
              (a, i) => (
                <div
                  key={i}
                  className="
                    flex
                    items-center
                    justify-between

                    gap-4

                    px-5
                    py-4

                    rounded-2xl

                    bg-emerald-50
                    dark:bg-emerald-500/10

                    border
                    border-emerald-100
                    dark:border-emerald-500/20
                  "
                >
                  <span
                    className="
                      font-medium

                      text-gray-700
                      dark:text-gray-200
                    "
                  >
                    Attempt{" "}
                    {i + 1}
                  </span>

                  <span
                    className="
                      font-bold

                      text-emerald-700
                      dark:text-emerald-300
                    "
                  >
                    {a.score}/
                    {a.total}
                    {" ("}
                    {
                      a.percentage
                    }
                    %)
                  </span>
                </div>
              )
            )}

          </div>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-6">

          {quiz.questions.map(
            (q, i) => {
              const userAnswer =
                latestAttempt
                  .answers[i];

              return (
                <div
                  key={i}
                  className="
                    p-6

                    rounded-3xl

                    bg-white/90
                    dark:bg-gray-900/80

                    backdrop-blur-xl

                    shadow-xl

                    border
                    border-emerald-200
                    dark:border-emerald-500/20
                  "
                >
                  {/* QUESTION */}
                  <h3
                    className="
                      font-bold

                      mb-5

                      text-lg
                      sm:text-xl

                      text-gray-800
                      dark:text-white

                      leading-relaxed
                    "
                  >
                    <span
                      className="
                        text-emerald-600
                        dark:text-emerald-300

                        mr-2
                      "
                    >
                      {i + 1}.
                    </span>

                    {q.question}
                  </h3>

                  {/* OPTIONS */}
                  <div className="space-y-3">

                    {q.options.map(
                      (
                        opt,
                        j
                      ) => {
                        const isUser =
                          userAnswer ===
                          opt;

                        const isCorrectOpt =
                          q.correctAnswer ===
                          opt;

                        return (
                          <div
                            key={j}
                            className={`
                              p-4

                              rounded-2xl

                              border

                              flex
                              items-center

                              gap-3

                              transition-all

                              ${
                                isCorrectOpt
                                  ? `
                                    bg-green-100
                                    dark:bg-green-500/10

                                    border-green-400
                                    dark:border-green-500/30

                                    text-green-900
                                    dark:text-green-200
                                  `
                                  : isUser
                                  ? `
                                    bg-red-100
                                    dark:bg-red-500/10

                                    border-red-400
                                    dark:border-red-500/30

                                    text-red-900
                                    dark:text-red-200
                                  `
                                  : `
                                    bg-gray-50
                                    dark:bg-gray-800

                                    border-gray-200
                                    dark:border-gray-700

                                    text-gray-700
                                    dark:text-gray-200
                                  `
                              }
                            `}
                          >
                            {/* ICON */}
                            {isCorrectOpt ? (
                              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 dark:text-green-300" />
                            ) : isUser ? (
                              <XCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-300" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-gray-400 dark:border-gray-600 shrink-0" />
                            )}

                            {/* TEXT */}
                            <span className="wrap-break-word">
                              {opt}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* EXPLANATION */}
                  <div
                    className="
                      mt-5

                      p-4

                      rounded-2xl

                      bg-blue-50
                      dark:bg-blue-500/10

                      border
                      border-blue-100
                      dark:border-blue-500/20

                      text-blue-800
                      dark:text-blue-200

                      text-sm
                    "
                  >
                    💡{" "}
                    {
                      q.explanation
                    }
                  </div>
                </div>
              );
            }
          )}

        </div>

        {/* BUTTONS */}
        <div
          className="
            flex

            flex-col
            sm:flex-row

            justify-center

            gap-4

            pt-2
          "
        >
          {/* RETAKE */}
          <Button
            onClick={() =>
              (window.location.href = `/quiz/${quizId}`)
            }
            className="
              rounded-2xl

              px-8
              py-6

              bg-emerald-600
              hover:bg-emerald-700

              text-white

              shadow-xl

              transition-all
            "
          >
            <RotateCcw className="w-4 h-4 mr-2" />

            Retake Quiz
          </Button>

          {/* BACK */}
          <Button
            className="
              rounded-2xl

              px-8
              py-6

              bg-white
              dark:bg-gray-900

              text-emerald-700
              dark:text-emerald-300

              border
              border-emerald-200
              dark:border-emerald-500/20

              hover:bg-emerald-50
              dark:hover:bg-gray-800

              shadow-xl

              transition-all
            "
            variant="outline"
            onClick={() => {
              if (!cid) return;

              window.location.href = `/course/${cid}`;
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />

            Back to Course
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;