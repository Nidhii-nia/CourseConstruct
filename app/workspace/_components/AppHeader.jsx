import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

function AppHeader() {
  return (
    <div className='p-3 sm:p-4 md:p-5 flex justify-between items-center shadow-sm border-b'>
        <SidebarTrigger className='h-8 w-8 sm:h-10 sm:w-10' />
        <UserButton 
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8 sm:h-10 sm:w-10'
            }
          }}
        />
    </div>
  )
}

export default AppHeader
