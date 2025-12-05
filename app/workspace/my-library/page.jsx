"use client";

import React, { useEffect, useState } from 'react'
import WelcomeBanner from '../_components/WelcomeBanner'
import EnrollCourseList from '../_components/EnrollCourseList'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

function MyLibrary() {
  const { isLoaded, user } = useUser() // ADD isLoaded
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // MODIFY: Check both isLoaded and user
    if (isLoaded && user) {
      fetchEnrolledCourses()
    } else if (isLoaded && !user) {
      // Auth loaded but no user = not signed in
      setLoading(false)
      setEnrolledCourses([])
    }
    // If isLoaded is false, wait (loading state remains true)
  }, [isLoaded, user]) // ADD isLoaded to dependencies

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/enroll-course')
      setEnrolledCourses(response.data || [])
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
      setEnrolledCourses([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <WelcomeBanner />
        <div className="mt-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Library</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-emerald-700 font-medium">Loading your courses...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <WelcomeBanner />
      
      <div className="mt-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Library</h2>
        <p className="text-gray-600 text-sm mt-1">
          {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No enrolled courses</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            You haven't enrolled in any courses yet. Explore courses and enroll to get started.
          </p>
          <a 
            href="/explore-courses" 
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Explore Courses
          </a>
        </div>
      ) : (
        <EnrollCourseList enrolledCourses={enrolledCourses} />
      )}
    </div>
  )
}

export default MyLibrary