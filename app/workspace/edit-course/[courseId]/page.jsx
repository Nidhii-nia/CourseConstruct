"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";

function EditCourse() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);

  const GetCourseInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/courses?courseId=${courseId}`);
      // API returns { courses: [ ... ] }
      const data = res.data;
      // Defensive: use first object from courses array
      if (Array.isArray(data.courses) && data.courses.length > 0) {
        setCourse(data.courses[0]);
      } else {
        setCourse(null);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) GetCourseInfo();
  }, [courseId]);

  // DEBUG: Check real structure
  useEffect(() => {
    console.log("COURSE:", course);
    console.log("COURSE JSON:", course?.courseJson);
    console.log("COURSE CONTENT:", course?.courseContent);
  }, [course]);

  const chapters = Array.isArray(course?.courseJson?.course?.chapters)
    ? course.courseJson.course.chapters
    : [];

  return (
    <div>
      {!loading && course && <CourseInfo course={course} />}
      {!loading && course && chapters.length > 0 && (
        <ChapterTopicList course={course} />
      )}
      {/* For debugging: show the raw object
      <h2>Debug Data</h2>
      <pre>{JSON.stringify(course, null, 2)}</pre> */}
    </div>
  );
}

export default EditCourse;
