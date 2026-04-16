"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { Loader2, RefreshCw, Search, X } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import CourseCard from "../_components/CourseCard";
import axios from "axios";
import debounce from "lodash/debounce";
import { useQuery } from "@tanstack/react-query";

function ExploreCourses() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [localInput, setLocalInput] = useState("");

  // Fetch explore courses (already filtered in backend)
  const {
    data: courseList = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["courses", "explore"],
    queryFn: async () => {
      const res = await axios.get("/api/courses/explore");
      return res.data?.courses || [];
    },
    enabled: !!user,
  });

  // Fetch enrolled courses
  const { 
    data: enrolledCourseList = [], 
    refetch: refetchEnrolled,
    isLoading: enrolledIsLoading,
    error: enrolledError,
    isFetching: enrolledIsFetching
  } = useQuery({
    queryKey: ["enrolledCourses"],
    queryFn: async () => {
      const res = await axios.get("/api/enroll-course");
      return res.data || [];
    },
    enabled: !!user,
  });

  // ✅ Debounce (fixed)
  const handleSearchChange = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value);
      }, 300),
    [],
  );

  const clearSearch = () => {
    setSearchQuery("");
    setLocalInput("");
  };

  // Handle input change - update local state immediately, debounce the actual search
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalInput(value);
    handleSearchChange(value);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      handleSearchChange.cancel?.();
    };
  }, [handleSearchChange]);

    const filteredCourses = useMemo(() => {
    let list = courseList;

    // ✅ Ensure only published (safety layer)
    list = list.filter((course) => course?.isPublished);

    // Search filter
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      list = list.filter((course) =>
        course?.name?.toLowerCase().includes(lower)
      );
    }

    // Remove enrolled courses
    return list.filter((course) => {
      const isEnrolled = enrolledCourseList?.some(
        (e) => e?.cid === course?.cid || e?.courses?.cid === course?.cid
      );

      return !isEnrolled;
    });
  }, [courseList, searchQuery, enrolledCourseList]);

  // ✅ Loading - check both queries
  if (isLoading || enrolledIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span className="text-emerald-700 font-medium mt-2">
          Fetching Courses...
        </span>
      </div>
    );
  }

  // ✅ Error - check both queries
  if (error || enrolledError) {
    return (
      <div className="text-red-500 mt-5">
        Failed to load courses. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Explore More Courses
        </h2>

        <Button
          onClick={() => {
            refetch();
            refetchEnrolled();
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(isFetching || enrolledIsFetching) ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* 🔍 Search */}
      <div className="relative flex gap-2 my-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

          <Input
            placeholder="Search courses by name..."
            value={localInput}
            onChange={handleInputChange}
            className="pl-10 pr-10 py-6 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />

          {localInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button 
          onClick={() => {
            setSearchQuery(localInput);
            handleSearchChange.cancel?.();
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
        >
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>
      </div>

      {/* 📊 Info */}
      {searchQuery && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-emerald-800">
            Showing results for{" "}
            <span className="font-semibold">"{searchQuery}"</span>
            {filteredCourses.length > 0 && (
              <span className="ml-2 text-emerald-600">
                ({filteredCourses.length} found)
              </span>
            )}
          </p>
        </div>
      )}

      {/* 📦 Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
          <Search className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">
            {searchQuery ? "No matching courses found" : "No courses available"}
          </h3>
          <p className="text-gray-500 mt-2">
            {searchQuery
              ? "Try a different search term."
              : "No courses to explore yet."}
          </p>

          {searchQuery && (
            <Button onClick={clearSearch} variant="outline" className="mt-4">
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.cid}
              course={course}
              enrolledCourseList={enrolledCourseList}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExploreCourses;
