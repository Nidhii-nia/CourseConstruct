"use client";
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

export const EnrollContext = createContext();

export const EnrollProvider = ({ children }) => {
  const [enrolledCourseList, setEnrolledCourseList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshFlagRef = useRef(0);
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef(null);

  const triggerRefresh = useCallback(() => {
    refreshFlagRef.current += 1;
    
    // Debounce rapid refresh calls
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchEnrolledCourses();
      }
    }, 100); // Small debounce delay
  }, []);

  // Manually add a course to the enrolled list (for optimistic updates)
  const addEnrolledCourse = useCallback((course) => {
    if (!isMountedRef.current) return;
    
    setEnrolledCourseList(prev => {
      // Check if already in list
      const exists = prev.some(item => item.courses?.cid === course.cid);
      if (!exists) {
        return [...prev, { courses: course, enrollCourse: { completedChapters: [] } }];
      }
      return prev;
    });
  }, []);

  const fetchEnrolledCourses = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await axios.get("/api/enroll-course");
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setEnrolledCourseList(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(err.message || "Failed to load enrolled courses");
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchEnrolledCourses();
    
    return () => {
      isMountedRef.current = false;
      
      // Cleanup timeout on unmount
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchEnrolledCourses]);

  return (
    <EnrollContext.Provider value={{ 
      enrolledCourseList, 
      triggerRefresh, 
      addEnrolledCourse,
      isLoading,
      error
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