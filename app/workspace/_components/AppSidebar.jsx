"use client"
import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { AlbumIcon, Book, BookCheck, DraftingCompass, Icon, LayoutPanelLeft, PencilLine, ReceiptIndianRupee, UserCog } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AddNewCourseDialogue from './AddNewCourseDialogue'

const SideBarOptions = [
    {
        title:'Dashboard',
        icon:LayoutPanelLeft,
        path:'/workspace'
    },
    {
        title:'My Library',
        icon:AlbumIcon,
        path:'/workspace/my-courses'
    },
    {
        title:'Explore Courses',
        icon:DraftingCompass,
        path:'/workspace/explore'
    },
    {
        title:'Billing',
        icon:ReceiptIndianRupee,
        path:'/workspace/billing'
    },
    {
        title:'Profile',
        icon:UserCog,
        path:'/workspace/profile'
    },
]

function AppSidebar() {
    const path = usePathname();

  return (
    <Sidebar>
        <SidebarHeader className='p-2 sm:p-3 m-1'>
            <Image src='/logo.svg' alt='logo' width={250} height={300} className='w-full h-auto max-w-[200px] sm:max-w-[250px]'/>
        </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <AddNewCourseDialogue>
                <Button className='w-full text-sm sm:text-base'>Create New Course</Button>
            </AddNewCourseDialogue>
        </SidebarGroup>
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {SideBarOptions.map((item,index)=>(
                        <SidebarMenuItem key={index}>
                            <SidebarMenuButton asChild className='p-3 sm:p-4 md:p-5'>
                                <Link href={item.path} className={`text-sm sm:text-base md:text-[17px] font-bold text-black
                                    ${path.includes(item.path) && 'text-primary bg-cyan-200'}`}>
                                
                                <item.icon className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10'/>
                                <span className='truncate'>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export default AppSidebar
