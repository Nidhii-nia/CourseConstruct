import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

function AppHeader({hideSidebar=false}) {
  return (
    <div className='p-2 sm:p-4 md:p-3 flex justify-between items-center shadow-sm border-b bg-white'>
        {!hideSidebar && <SidebarTrigger className='h-8 w-8 sm:h-10 sm:w-10' />}
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
