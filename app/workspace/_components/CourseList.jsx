"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AddNewCourseDialogue from "./AddNewCourseDialogue";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      GetCourseList();
    } else {
      setLoading(false);
    }
  }, [user]);

  const GetCourseList = async () => {
    try {
      setLoading(true);
      const result = await axios.get('/api/courses');
      setCourseList(result.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourseList([]);
    } finally {
      setLoading(false);
    }
  }

  // Show loading spinner
  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-emerald-950 mt-5 mb-4">Course List</h2>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-emerald-700 font-medium">Fetching Your Courses...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-emerald-950 mt-5 mb-4">Course List</h2>
      
      {courseList?.length == 0 ? (
        <div className="border-2 border-dashed border-emerald-900 p-2 rounded-2xl mt-2 bg-white/50">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-8">
              <Image 
                src="/learnpic.png" 
                alt="No courses" 
                width={200} 
                height={200}
                className="opacity-90"
              />
            </div>
            <h2 className="text-xl font-semibold text-emerald-900 mb-3">
              No courses created yet
            </h2>
            <p className="text-emerald-700 mb-10 max-w-md">
              Get started by creating your first course to share knowledge
            </p>
            
            <AddNewCourseDialogue>
              <Button className="px-6 py-3">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Your First Course
              </Button>
            </AddNewCourseDialogue>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {courseList.map((course,index)=>(
            <CourseCard course={course} key={index}/>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;