"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

export const EnrollContext = createContext();

export const EnrollProvider = ({ children }) => {
  const [enrolledCourseList, setEnrolledCourseList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  const fetchEnrolledCourses = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) {
      console.log("Already loading, skipping");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Fetching enrolled courses...");
      const result = await axios.get("/api/enroll-course");
      console.log("Got", result.data?.length, "enrolled courses");
      setEnrolledCourseList(result.data || []);
      hasFetched.current = true;
    } catch (err) {
      console.error("Error:", err);
      setEnrolledCourseList([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependencies - stable function

  const triggerRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // Fetch ONCE on mount
  useEffect(() => {
    if (!hasFetched.current) {
      fetchEnrolledCourses();
    }
  }, []); // Empty array - runs once

  return (
    <EnrollContext.Provider value={{ 
      enrolledCourseList, 
      triggerRefresh,
      isLoading
    }}>
      {children}
    </EnrollContext.Provider>
  );
};

export const useEnrollContext = () => {
  const context = useContext(EnrollContext);
  if (!context) {
    throw new Error("useEnrollContext must be used within an EnrollProvider");
  }
  return context;
};