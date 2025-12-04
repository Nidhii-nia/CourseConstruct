"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { Loader2, Search, X } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import CourseCard from "../_components/CourseCard";
import axios from "axios";
import debounce from "lodash/debounce";

function ExploreCourses() {
  const [courseList, setCourseList] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
      const result = await axios.get("/api/courses?courseId=0");
      console.log("Explore courses API response:", result.data);
      
      // FIX: Extract the courses array from response
      const courses = result.data?.courses || result.data || [];
      console.log("Extracted courses:", courses);
      
      // Ensure it's an array
      const coursesArray = Array.isArray(courses) ? courses : [];
      
      setCourseList(coursesArray);
      setFilteredCourses(coursesArray);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourseList([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (!query.trim()) {
        setFilteredCourses(courseList);
        return;
      }

      const filtered = courseList.filter((course) =>
        course?.name?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }, 300),
    [courseList]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredCourses(courseList);
  };

  // Show loading spinner
  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-emerald-950 mt-5 mb-4">
          Course List
        </h2>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-emerald-700 font-medium">
              Fetching Courses...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Check what filteredCourses contains
  console.log("filteredCourses before render:", filteredCourses);
  console.log("Is array?", Array.isArray(filteredCourses));

  // Make sure filteredCourses is always an array before rendering
  const safeFilteredCourses = Array.isArray(filteredCourses) ? filteredCourses : [];

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
        Explore More Courses
      </h2>

      {/* Search Bar with Functionality */}
      <div className="relative flex gap-2 my-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10 py-6 text-lg border-2 border-gray-200 rounded-xl shadow-sm hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6 py-6">
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-emerald-800">
            Showing results for: <span className="font-semibold">"{searchQuery}"</span>
            {safeFilteredCourses.length > 0 && (
              <span className="text-emerald-600 ml-2">
                ({safeFilteredCourses.length} course{safeFilteredCourses.length !== 1 ? 's' : ''} found)
              </span>
            )}
          </p>
        </div>
      )}

      {safeFilteredCourses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery ? 'No matching courses found' : 'No courses available'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            {searchQuery 
              ? `No courses found with name containing "${searchQuery}". Try a different search term.`
              : 'There are no published courses to explore yet.'}
          </p>
          {searchQuery && (
            <Button
              onClick={clearSearch}
              variant="outline"
              className="mt-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              Clear Search & Show All Courses
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {searchQuery ? 'Search results' : 'All courses'}:{" "}
              <span className="font-bold text-emerald-700">{safeFilteredCourses.length}</span> course{safeFilteredCourses.length !== 1 ? 's' : ''}
              {searchQuery && (
                <span className="text-gray-500 ml-2">
                  (out of {courseList.length} total)
                </span>
              )}
            </p>
            {searchQuery && (
              <Button
                onClick={clearSearch}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear search
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeFilteredCourses.map((course, index) => (
              <CourseCard course={course} key={index} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ExploreCourses;