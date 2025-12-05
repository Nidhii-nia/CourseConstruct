"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useUser } from '@clerk/nextjs'; // ADD THIS IMPORT

export const EnrollContext = createContext();

export const EnrollProvider = ({ children }) => {
  const [enrolledCourseList, setEnrolledCourseList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);
  const { isLoaded, isSignedIn } = useUser(); // ADD THIS LINE

  const fetchEnrolledCourses = useCallback(async () => {
    // ADD AUTH CHECK HERE
    if (!isLoaded || !isSignedIn) {
      console.log("Auth not loaded or user not signed in, skipping fetch");
      return;
    }
    
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
  }, [isLoading, isLoaded, isSignedIn]); // ADD DEPENDENCIES

  const triggerRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // MODIFY THIS EFFECT TO CHECK AUTH
  useEffect(() => {
    if (!hasFetched.current && isLoaded && isSignedIn) {
      fetchEnrolledCourses();
    }
  }, [isLoaded, isSignedIn, fetchEnrolledCourses]);

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