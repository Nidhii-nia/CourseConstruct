// import { SidebarTrigger } from '@/components/ui/sidebar'
// import { UserButton } from '@clerk/nextjs'
// import React from 'react'

// function AppHeader({hideSidebar=false}) {
//   return (
//     <div className='p-2 sm:p-4 md:p-3 flex justify-between items-center shadow-sm border-b bg-white'>
//         {!hideSidebar && <SidebarTrigger className='h-8 w-8 sm:h-10 sm:w-10' />}
//       <div className="ml-auto">
//         <UserButton
//           appearance={{
//             elements: {
//               avatarBox: 'h-8 w-8 sm:h-10 sm:w-10',
//             },
//           }}
//         />
//       </div>
//     </div>
//   )
// }

// export default AppHeader

import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton, useUser } from '@clerk/nextjs' // Added useUser
import { Button } from '@/components/ui/button' // Added Button import
import { useRouter } from 'next/navigation' // Added useRouter
import React from 'react'

function AppHeader({ hideSidebar = false }) {
  const { isSignedIn } = useUser() // Get authentication status
  const router = useRouter() // Get router for navigation

  return (
    <div className='p-2 sm:p-4 md:p-3 flex justify-between items-center shadow-sm border-b bg-white'>
      {!hideSidebar && <SidebarTrigger className='h-8 w-8 sm:h-10 sm:w-10' />}
      
      <div className="ml-auto">
        {!isSignedIn ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-3 text-sm"
              onClick={() => router.push("/sign-in")}
            >
              Sign In
            </Button>
            <Button 
              size="sm"
              className="h-8 px-3 text-sm"
              onClick={() => router.push("/sign-up")}
            >
              Sign Up
            </Button>
          </div>
        ) : (
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-8 w-8 sm:h-10 sm:w-10',
              },
            }}
          />
        )}
      </div>
    </div>
  )
}

export default AppHeader
