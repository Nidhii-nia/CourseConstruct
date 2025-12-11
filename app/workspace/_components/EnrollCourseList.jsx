"use client";

import React from "react";
import EnrolledCourseCard from "./EnrolledCourseCard";
import { useEnrollContext } from "@/context/EnrollContext";
import { Loader2 } from "lucide-react";

function EnrollCourseList() {
  const { enrolledCourseList, isLoading } = useEnrollContext();

  if (isLoading) {
    return (
      <div className='mt-3'>
        <h2 className='font-bold text-xl text-emerald-950 mb-3'>Continue Learning</h2>
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-emerald-700 font-medium">Fetching Enrolled Courses</p>
        </div>
      </div>
    );
  }

  if (!enrolledCourseList?.length) {
    return null;
  }

  return (
    <div className='mt-3'>
      <h2 className='font-bold text-xl text-emerald-950'>Continue Learning</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
        {enrolledCourseList.map((course, index) => (
          <EnrolledCourseCard
            key={course?.courses?.cid || index}
            course={course?.courses || {}}
            enrolledCourse={course?.enrollCourse}
          />
        ))}
      </div>
    </div>
  );
}

export default EnrollCourseList;