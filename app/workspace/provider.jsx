"use client";
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import AppSidebar from './_components/AppSidebar'
import AppHeader from './_components/AppHeader'

function WorkspaceProvider({children}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='flex-1 w-full min-h-screen overflow-x-hidden'>
        <AppHeader />
        <div className='p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto'>
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}

export default WorkspaceProvider
