"use client";

import ChapterContent from "@/app/course/_components/ChapterContent";
import ChapterListSidebar from "@/app/course/_components/ChapterListSidebar";
import AppHeader from "@/app/workspace/_components/AppHeader";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

function Course() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState();
  const topicRefs = useRef([]); // <-- add ref array for topics

  useEffect(() => {
    GetEnrolledCoursesById();
  }, []);

  const GetEnrolledCoursesById = async () => {
    try {
      console.log("courseId from params:", courseId);
      const result = await axios.get(`/api/enroll-course?courseId=${courseId}`);
      console.log("Enrolled Courses:", result.data);
      setCourseInfo(result.data);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
    }
  };

  return (
    <div>
      <AppHeader hideSidebar={true} />
      <div className="flex gap-10">
        <ChapterListSidebar courseInfo={courseInfo} topicRefs={topicRefs} /> {/* pass refs */}
        <div className="ml-80 w-full">
          <ChapterContent courseInfo={courseInfo} topicRefs={topicRefs} /> {/* pass refs */}
        </div>
      </div>
    </div>
  );
}

export default Course;
