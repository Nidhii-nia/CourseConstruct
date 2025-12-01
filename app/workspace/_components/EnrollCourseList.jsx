"use client";

import React from "react";
import EnrolledCourseCard from "./EnrolledCourseCard";
import { useEnrollContext } from "@/context/EnrollContext";

function EnrollCourseList() {

  const { enrolledCourseList } = useEnrollContext();

  return (
    enrolledCourseList?.length > 0 && (
      <div className='mt-3'>
        <h2 className='font-bold text-xl text-emerald-950'>Continue Learning</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
          {enrolledCourseList.map((course, index) => (
            <EnrolledCourseCard
              key={index}
              course={course?.courses}
              enrolledCourse={course?.enrollCourse}
            />
          ))}
        </div>
      </div>
    )
  );
}

export default EnrollCourseList;
