"use client";

import React, { useState, useEffect } from "react";
import EnrollCourseList from "../_components/EnrollCourseList";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function EnrolledCourses() {
  const { isLoaded, user } = useUser();

  // ✅ NEW: get user email
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const { data, isLoading, refetch, isFetching } = useQuery({
    // ✅ FIXED: dynamic query key
    queryKey: ["enrolledCourses", userEmail],
    queryFn: async () => {
      const res = await axios.get("/api/enroll-course");
      return res.data || [];
    },
    // ✅ FIXED: better enabled condition
    enabled: isLoaded && !!userEmail,
  });

  console.log("API DATA ENROLLED cOURSES:", data);

  // ✅ NEW: local state for instant UI updates
  const [localCourses, setLocalCourses] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setLocalCourses(data);
    }
  }, [data]);

  const enrolledCourses = localCourses;

  const handleUnenroll = async (cid) => {
    try {
      // ✅ FIXED: correct filtering path
      setLocalCourses((prev) =>
        prev.filter((course) => course?.cid !== cid)
      );

      await axios.delete(`/api/enroll-course?cid=${cid}`);

      await refetch();

      toast.success("Unenrolled successfully");
    } catch (err) {
      console.error(err);

      await refetch();

      if (err?.response?.status === 405) {
        toast.error("Unenroll not allowed (API method issue)");
      } else if (err?.response?.status === 401) {
        toast.error("Please login again");
      } else if (err?.response?.status === 404) {
        toast.error("Course not found or already removed");
      } else if (!err?.response) {
        toast.error("No internet connection");
      } else {
        toast.error("Failed to unenroll. Try again.");
      }
      // Don't re-throw - handle error locally
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span className="text-emerald-700 font-medium mt-2">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 🔄 Header with Refresh */}
      <div className="mt-6 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enrolled Courses</h2>
          <p className="text-gray-600 text-sm mt-1">
            {enrolledCourses.length} course
            {enrolledCourses.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ✅ PASS HANDLER */}
      <EnrollCourseList
        enrolledCourseList={enrolledCourses}
        isLoading={isLoading}
        onUnenroll={handleUnenroll}
      />
    </div>
  );
}

export default EnrolledCourses;