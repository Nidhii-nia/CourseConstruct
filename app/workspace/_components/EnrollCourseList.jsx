"use client";

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import EnrolledCourseCard from './EnrolledCourseCard';

function EnrollCourseList() {

  const [enrolledCourseList, setEnrolledCourseList] = useState([]);

  useEffect(() => {
    GetEnrolledCoursesList();
  }, []);

  const GetEnrolledCoursesList = async () => {
    try {
      const result = await axios.get('/api/enroll-course');
      console.log("Enrolled Courses:", result.data);
      setEnrolledCourseList(result.data);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
    }
  };

  return enrolledCourseList?.length > 0 && (
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
  );
}

export default EnrollCourseList;
