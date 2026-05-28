"use client";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { useUser } from "@clerk/nextjs";

import {
  Loader2,
  RefreshCw,
  Search,
  X,
  Compass,
} from "lucide-react";

import React, {
  useState,
  useMemo,
  useEffect,
} from "react";

import CourseCard from "../_components/CourseCard";

import axios from "axios";

import debounce from "lodash/debounce";

import { useQuery } from "@tanstack/react-query";

function ExploreCourses() {

  const { user } =
    useUser();

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    localInput,
    setLocalInput,
  ] = useState("");

  /* =========================================
     FETCH COURSES
  ========================================= */

  const {
    data: courseList = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({

    queryKey: [
      "courses",
      "explore",
    ],

    queryFn: async () => {

      const res =
        await axios.get(
          "/api/courses/explore"
        );

      return (
        res.data?.courses ||
        []
      );
    },

    enabled: !!user,

    staleTime:
      1000 * 60 * 5,

    gcTime:
      1000 * 60 * 30,

    refetchOnWindowFocus:
      false,

    refetchOnReconnect:
      false,

    retry: 1,
  });

  /* =========================================
     FETCH ENROLLED
  ========================================= */

  const {
    data:
      enrolledCourseList =
        [],

    refetch:
      refetchEnrolled,

    isLoading:
      enrolledIsLoading,

    error:
      enrolledError,

    isFetching:
      enrolledIsFetching,
  } = useQuery({

    queryKey: [
      "enrolledCourses",
    ],

    queryFn: async () => {

      const res =
        await axios.get(
          "/api/enroll-course"
        );

      return (
        res.data?.courses ||
        []
      );
    },

    enabled: !!user,

    staleTime:
      1000 * 60 * 5,

    gcTime:
      1000 * 60 * 30,

    refetchOnWindowFocus:
      false,

    refetchOnReconnect:
      false,

    retry: 1,
  });

  /* =========================================
     DEBOUNCE
  ========================================= */

  const handleSearchChange =
    useMemo(
      () =>
        debounce(
          (value) => {
            setSearchQuery(
              value
            );
          },
          300
        ),
      []
    );

  const clearSearch =
    () => {
      setSearchQuery("");

      setLocalInput("");
    };

  const handleInputChange =
    (e) => {

      const value =
        e.target.value;

      setLocalInput(
        value
      );

      handleSearchChange(
        value
      );
    };

  useEffect(() => {
    return () => {
      handleSearchChange.cancel?.();
    };
  }, [
    handleSearchChange,
  ]);

  /* =========================================
     ENROLLED SET
  ========================================= */

  const enrolledSet =
    useMemo(
      () =>
        new Set(
          Array.isArray(
            enrolledCourseList
          )
            ? enrolledCourseList.map(
                (
                  e
                ) =>
                  e?.cid ||
                  e
                    ?.courses
                    ?.cid
              )
            : []
        ),
      [
        enrolledCourseList,
      ]
    );

  /* =========================================
     FILTER
  ========================================= */

  const filteredCourses =
    useMemo(() => {

      let list =
        courseList;

      list = list.filter(
        (course) =>
          course?.isPublished
      );

      if (
        searchQuery.trim()
      ) {

        const lower =
          searchQuery.toLowerCase();

        list =
          list.filter(
            (
              course
            ) =>
              course?.name
                ?.toLowerCase()
                .includes(
                  lower
                )
          );
      }

      return list.filter(
        (course) => {

          const isEnrolled =
            enrolledSet.has(
              course?.cid
            );

          return !isEnrolled;
        }
      );
    }, [
      courseList,
      searchQuery,
      enrolledCourseList,
    ]);

  /* =========================================
     LOADING
  ========================================= */

  if (
    isLoading ||
    enrolledIsLoading
  ) {

    return (
      <div
        className="
          min-h-[70vh]

          flex
          flex-col

          items-center
          justify-center

          gap-4
        "
      >
        <div
          className="
            p-5

            rounded-full

            bg-emerald-100
            dark:bg-emerald-500/10
          "
        >
          <Loader2
            className="
              h-8
              w-8

              animate-spin

              text-emerald-600
              dark:text-emerald-300
            "
          />
        </div>

        <div className="text-center">

          <h3
            className="
              text-lg
              font-bold

              text-emerald-800
              dark:text-emerald-300
            "
          >
            Fetching Courses...
          </h3>

          <p
            className="
              text-sm

              text-gray-500
              dark:text-gray-400

              mt-1
            "
          >
            Loading available courses
          </p>

        </div>
      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (
    error ||
    enrolledError
  ) {

    return (
      <div
        className="
          mt-10

          rounded-3xl

          border
          border-red-200
          dark:border-red-500/20

          bg-red-50
          dark:bg-red-500/10

          p-8

          text-center
        "
      >
        <h3
          className="
            text-xl
            font-bold

            text-red-700
            dark:text-red-300
          "
        >
          Failed to load courses
        </h3>

        <p
          className="
            mt-2

            text-red-600
            dark:text-red-400
          "
        >
          Please try again later.
        </p>
      </div>
    );
  }

  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div
      className="
        min-h-screen

        p-4
        sm:p-6

        bg-gradient-to-br
        from-emerald-50
        via-white
        to-cyan-50

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          flex-col
          lg:flex-row

          lg:items-center
          lg:justify-between

          gap-5

          mb-8
        "
      >
        {/* TITLE */}
        <div
          className="
            flex
            items-center

            gap-4
          "
        >
          <div
            className="
              w-14
              h-14

              rounded-2xl

              bg-emerald-100
              dark:bg-emerald-500/10

              flex
              items-center
              justify-center
            "
          >
            <Compass
              className="
                h-7
                w-7

                text-emerald-700
                dark:text-emerald-300
              "
            />
          </div>

          <div>

            <h2
              className="
                text-3xl
                md:text-4xl

                font-black

                text-emerald-900
                dark:text-emerald-300
              "
            >
              Explore Courses
            </h2>

            <p
              className="
                text-sm

                text-gray-500
                dark:text-gray-400

                mt-1
              "
            >
              Discover new courses to
              expand your knowledge
            </p>

          </div>
        </div>

        {/* REFRESH */}
        <Button
          onClick={() => {
            refetch();

            refetchEnrolled();
          }}
          className="
            rounded-2xl

            bg-emerald-600
            hover:bg-emerald-700

            text-white

            flex
            items-center

            gap-2

            px-5
            py-6

            shadow-lg
            hover:shadow-xl

            transition-all
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              (
                isFetching ||
                enrolledIsFetching
              )
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </Button>
      </div>

      {/* SEARCH */}
      <div
        className="
          flex
          flex-col
          sm:flex-row

          gap-3

          mb-8
        "
      >
        <div className="relative flex-1">

          <Search
            className="
              absolute

              left-4
              top-1/2

              -translate-y-1/2

              text-gray-400

              h-5
              w-5
            "
          />

          <Input
            placeholder="Search courses by name..."
            value={localInput}
            onChange={
              handleInputChange
            }
            className="
              pl-12
              pr-12

              py-7

              text-lg

              rounded-2xl

              border-2
              border-gray-200
              dark:border-gray-700

              bg-white
              dark:bg-gray-900

              shadow-sm

              focus:border-emerald-500
              focus:ring-emerald-200

              dark:text-white
            "
          />

          {localInput && (
            <button
              onClick={
                clearSearch
              }
              className="
                absolute

                right-4
                top-1/2

                -translate-y-1/2

                text-gray-400
                hover:text-gray-600
              "
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <Button
          onClick={() => {

            setSearchQuery(
              localInput
            );

            handleSearchChange.cancel?.();
          }}
          className="
            rounded-2xl

            bg-emerald-600
            hover:bg-emerald-700

            text-white

            px-7

            shadow-lg

            transition-all
          "
        >
          <Search className="w-5 h-5 mr-2" />

          Search
        </Button>
      </div>

      {/* SEARCH INFO */}
      {searchQuery && (
        <div
          className="
            mb-6

            rounded-2xl

            border
            border-emerald-200
            dark:border-emerald-500/20

            bg-emerald-50
            dark:bg-emerald-500/10

            px-5
            py-4
          "
        >
          <p
            className="
              text-emerald-800
              dark:text-emerald-300
            "
          >
            Showing results for{" "}

            <span className="font-bold">
              "{searchQuery}"
            </span>

            {filteredCourses.length >
              0 && (
              <span
                className="
                  ml-2

                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                (
                {
                  filteredCourses.length
                }{" "}
                found)
              </span>
            )}
          </p>
        </div>
      )}

      {/* EMPTY */}
      {filteredCourses.length ===
        0 ? (
        <div
          className="
            flex
            flex-col

            items-center
            justify-center

            text-center

            rounded-3xl

            border-2
            border-dashed
            border-gray-300
            dark:border-gray-700

            bg-white/80
            dark:bg-gray-900/80

            backdrop-blur-xl

            py-20

            shadow-xl
          "
        >
          <div
            className="
              mb-5

              rounded-full

              bg-emerald-100
              dark:bg-emerald-500/10

              p-5
            "
          >
            <Search
              className="
                h-10
                w-10

                text-emerald-700
                dark:text-emerald-300
              "
            />
          </div>

          <h3
            className="
              text-2xl
              font-bold

              text-gray-800
              dark:text-white
            "
          >
            {searchQuery
              ? "No matching courses found"
              : "No courses available"}
          </h3>

          <p
            className="
              mt-2

              text-gray-500
              dark:text-gray-400
            "
          >
            {searchQuery
              ? "Try a different search term."
              : "No courses to explore yet."}
          </p>

          {searchQuery && (
            <Button
              onClick={
                clearSearch
              }
              variant="outline"
              className="mt-5 rounded-2xl"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        /* GRID */
        <div
          className="
            grid

            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            2xl:grid-cols-4

            gap-5

            justify-items-center
          "
        >
          {filteredCourses.map(
            (course) => (
              <CourseCard
                key={
                  course.cid
                }
                course={course}
                enrolledCourseList={
                  enrolledCourseList
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
export default ExploreCourses;