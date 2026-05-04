"use client";
import React, { useState } from "react";
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
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {toast} from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  AlbumIcon,
  DraftingCompass,
  LayoutPanelLeft,
  ReceiptIndianRupee,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddNewCourseDialogue from "./AddNewCourseDialogue";

const SideBarOptions = [
  {
    title: "Dashboard",
    icon: LayoutPanelLeft,
    path: "/workspace",
  },
  {
    title: "Enrolled Courses",
    icon: AlbumIcon,
    path: "/workspace/enrolled-courses",
  },
  {
    title: "Explore Courses",
    icon: DraftingCompass,
    path: "/workspace/explore-courses",
  },
  {
    title: "Billing",
    icon: ReceiptIndianRupee,
    path: "/workspace/billing",
  },
  {
    title: "Profile",
    icon: UserCog,
    path: "/workspace/profile",
  },
];

function AppSidebar() {
  const path = usePathname();
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const handleCreateClick = async () => {
    try {
      const res = await axios.get("/api/check-course-limit");

      if (res.data.allowed) {
        setOpenDialog(true);
      } else {
        toast.warning("Free users can only create one course.");
        router.push("/workspace/billing");
      }
    } catch (err) {
      toast.error("Failed to check access");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-2 sm:p-3 m-1">
        <Image
          src="/logo.svg"
          alt="logo"
          width={250}
          height={300}
          className="w-full h-auto max-w-50 sm:max-w-250"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <AddNewCourseDialogue>
            {/* <Button className="w-full text-sm sm:text-base">
              Create New Course
            </Button> */}
            <AddNewCourseDialogue open={openDialog} setOpen={setOpenDialog}>
              <Button
                onClick={handleCreateClick}
                className="w-full text-sm sm:text-base"
              >
                Create New Course
              </Button>
            </AddNewCourseDialogue>
          </AddNewCourseDialogue>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SideBarOptions.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild className="p-3 sm:p-4 md:p-5">
                    <Link
                      href={item.path}
                      className={`text-sm sm:text-base md:text-[17px] font-bold text-black
                                    ${
                                      path === item.path &&
                                      "text-primary bg-cyan-200"
                                    }
`}
                    >
                      <item.icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                      <span className="truncate">{item.title}</span>
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
  );
}

export default AppSidebar;
