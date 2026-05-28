"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import { useUser } from "@clerk/nextjs";

import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function QuizPage() {
  const { quizId } =
    useParams();

  const { user } =
    useUser();

  const [quiz, setQuiz] =
    useState(null);

  const [cid, setCid] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /* =========================
     FETCH QUIZ
  ========================= */

  useEffect(() => {
    const fetchQuiz =
      async () => {
        try {
          const res =
            await axios.get(
              `/api/quiz/get-quiz?quizId=${quizId}`
            );

          console.log(
            "FULL RESPONSE:",
            res.data
          );

          const quizData =
            res.data.quiz;

          setQuiz(
            quizData.quizJson
          );

          // SAFE CID
          setCid(
            res.data.cid ||
              quizData.cid
          );
        } catch (err) {
          console.error(err);

          toast.error(
            "Failed to load quiz"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchQuiz();
  }, [quizId]);

  /* =========================
     HANDLE SELECT
  ========================= */

  const handleSelect = (
    qIndex,
    option
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  /* =========================
     HANDLE SUBMIT
  ========================= */

  const handleSubmit =
    async () => {
      if (submitting) return;

      const totalQuestions =
        quiz?.questions
          ?.length || 0;

      if (
        Object.keys(answers)
          .length <
        totalQuestions
      ) {
        toast.error(
          "Please answer all questions"
        );

        return;
      }

      setSubmitting(true);

      try {
        await axios.post(
          "/api/quiz/submit-quiz",
          {
            quizId,

            answers,

            useremail:
              user
                ?.primaryEmailAddress
                ?.emailAddress ||
              user
                ?.emailAddresses?.[0]
                ?.emailAddress,
          }
        );

        window.location.href = `/quiz/result/${quizId}`;
      } catch (err) {
        console.error(err);

        toast.error(
          "Submission failed"
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* =========================
     HANDLE ABORT
  ========================= */

  const handleAbort = () => {
    const courseId =
      cid || quiz?.cid;

    if (!courseId) {
      toast.error(
        "Course not found"
      );

      return;
    }

    toast.warning(
      "Leave quiz?",
      {
        description:
          "Your progress will be lost.",

        duration:
          Infinity,

        action: {
          label: "Leave",

          onClick: () => {
            window.location.href = `/course/${courseId}`;
          },
        },

        cancel: {
          label: "Stay",
        },
      }
    );
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div
        className="
          min-h-screen

          flex
          items-center
          justify-center

          px-4

          bg-gradient-to-br
          from-emerald-50
          via-white
          to-blue-50

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

            bg-white/90
            dark:bg-gray-900/80

            backdrop-blur-xl

            rounded-3xl

            shadow-2xl

            border
            border-emerald-100
            dark:border-emerald-500/20

            max-w-md
            w-full
          "
        >
          {/* SPINNER */}
          <div className="relative">

            <Loader2
              className="
                w-14
                h-14

                text-emerald-600
                dark:text-emerald-300

                animate-spin
              "
            />

            <div
              className="
                absolute
                inset-0

                rounded-full

                blur-xl

                bg-emerald-200
                dark:bg-emerald-500/20

                opacity-40
              "
            />

          </div>

          {/* TEXT */}
          <div className="text-center">

            <h2
              className="
                text-xl
                font-bold

                text-emerald-700
                dark:text-emerald-300
              "
            >
              Preparing your
              quiz...
            </h2>

            <p
              className="
                text-sm

                text-gray-500
                dark:text-gray-400

                mt-1
              "
            >
              Hang tight,
              questions are
              loading
            </p>

          </div>

          {/* DOTS */}
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
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-green-100
        via-emerald-50
        to-green-200

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

          space-y-6
        "
      >
        {/* HEADER */}
        <div
          className="
            bg-white/90
            dark:bg-gray-900/80

            backdrop-blur-xl

            rounded-3xl

            border
            border-emerald-100
            dark:border-emerald-500/20

            shadow-xl

            p-5
            sm:p-7
          "
        >
          {/* TOP BAR */}
          <div
            className="
              flex

              flex-col
              sm:flex-row

              sm:items-center
              sm:justify-between

              gap-4
            "
          >
            <div>

              <h1
                className="
                  text-3xl
                  sm:text-4xl

                  font-black

                  text-emerald-700
                  dark:text-emerald-300
                "
              >
                Final Quiz
              </h1>

              <p
                className="
                  text-sm

                  text-gray-500
                  dark:text-gray-400

                  mt-2
                "
              >
                Answer all
                questions to
                complete the quiz
              </p>

            </div>

            {/* ABORT */}
            <Button
              className="
                bg-red-600
                hover:bg-red-700

                text-white

                rounded-2xl

                shadow-lg

                transition-all

                w-full
                sm:w-auto
              "
              onClick={
                handleAbort
              }
            >
              <AlertTriangle className="w-4 h-4 mr-2" />

              Abort Quiz
            </Button>
          </div>

          {/* PROGRESS */}
          <div className="mt-6">

            <div
              className="
                flex
                items-center
                justify-between

                text-sm

                mb-2
              "
            >
              <span
                className="
                  text-gray-600
                  dark:text-gray-300
                "
              >
                Progress
              </span>

              <span
                className="
                  font-semibold

                  text-emerald-700
                  dark:text-emerald-300
                "
              >
                {
                  Object.keys(
                    answers
                  ).length
                }
                {" / "}
                {
                  quiz?.questions
                    ?.length
                }
              </span>

            </div>

            <div
              className="
                w-full

                h-3

                rounded-full

                bg-emerald-100
                dark:bg-gray-800

                overflow-hidden
              "
            >
              <div
                className="
                  h-full

                  bg-gradient-to-r
                  from-emerald-500
                  to-green-600

                  rounded-full

                  transition-all
                  duration-500
                "
                style={{
                  width: `${
                    (Object.keys(
                      answers
                    ).length /
                      quiz
                        ?.questions
                        ?.length) *
                    100
                  }%`,
                }}
              />
            </div>

          </div>
        </div>

        {/* QUESTIONS */}
        {quiz?.questions?.map(
          (q, i) => (
            <div
              key={i}
              className="
                p-5
                sm:p-7

                rounded-3xl

                shadow-xl

                border
                border-emerald-100
                dark:border-emerald-500/20

                bg-white/90
                dark:bg-gray-900/80

                backdrop-blur-xl

                hover:shadow-2xl

                transition-all
                duration-300
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
                    const isSelected =
                      answers[i] ===
                      opt;

                    return (
                      <button
                        key={j}
                        onClick={() =>
                          handleSelect(
                            i,
                            opt
                          )
                        }
                        className={`
                          w-full

                          text-left

                          p-4

                          rounded-2xl

                          border

                          transition-all
                          duration-300

                          hover:scale-[1.01]

                          flex
                          items-center

                          gap-3

                          ${
                            isSelected
                              ? `
                                bg-emerald-100
                                dark:bg-emerald-500/20

                                text-emerald-950
                                dark:text-emerald-200

                                border-emerald-500

                                shadow-md
                              `
                              : `
                                bg-green-50
                                dark:bg-gray-800

                                hover:bg-green-100
                                dark:hover:bg-gray-700

                                border-green-200
                                dark:border-gray-700

                                text-gray-800
                                dark:text-gray-200
                              `
                          }
                        `}
                      >
                        {/* RADIO */}
                        <div
                          className={`
                            w-5
                            h-5

                            rounded-full

                            border-2

                            flex
                            items-center
                            justify-center

                            shrink-0

                            ${
                              isSelected
                                ? `
                                  border-emerald-600
                                  dark:border-emerald-300
                                `
                                : `
                                  border-gray-400
                                  dark:border-gray-500
                                `
                            }
                          `}
                        >
                          {isSelected && (
                            <div
                              className="
                                w-2.5
                                h-2.5

                                rounded-full

                                bg-emerald-600
                                dark:bg-emerald-300
                              "
                            />
                          )}
                        </div>

                        {/* OPTION */}
                        <span className="break-words">
                          {opt}
                        </span>

                        {/* CHECK */}
                        {isSelected && (
                          <CheckCircle2
                            className="
                              w-5
                              h-5

                              text-emerald-600
                              dark:text-emerald-300

                              ml-auto

                              shrink-0
                            "
                          />
                        )}
                      </button>
                    );
                  }
                )}

              </div>
            </div>
          )
        )}

        {/* SUBMIT */}
        <div className="flex justify-center pt-4">

          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              Object.keys(answers)
                .length !==
                quiz?.questions
                  ?.length
            }
            className="
              px-10
              py-6

              text-lg

              rounded-2xl

              bg-emerald-600
              hover:bg-emerald-700

              shadow-xl
              hover:shadow-2xl

              transition-all
              duration-300

              disabled:opacity-50
            "
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />

                Submitting...
              </span>
            ) : (
              "Submit Quiz"
            )}
          </Button>

        </div>
      </div>
    </div>
  );
}

export default QuizPage;