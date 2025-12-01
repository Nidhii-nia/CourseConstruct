import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import CourseList from './_components/CourseList'
import EnrollCourseList from './_components/EnrollCourseList'
import PageWrapper from '@/app/components/PageWrapper'

function Workspace() {
  return (
<PageWrapper>    <div className='m-0'>
      <WelcomeBanner/>
      <EnrollCourseList />
      <CourseList />
      </div>
      </PageWrapper>
  )
}

export default Workspace