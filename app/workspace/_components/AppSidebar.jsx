"use client";

import React, {
  useState,
} from "react";

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

import { toast } from "sonner";

import axios from "axios";

import { useRouter } from "next/navigation";

import {
  AlbumIcon,
  DraftingCompass,
  LayoutPanelLeft,
  ReceiptIndianRupee,
  UserCog,
  Sparkles,
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
  const path =
    usePathname();

  const [
    openDialog,
    setOpenDialog,
  ] = useState(false);

  const router =
    useRouter();

  /* =========================
     HANDLE CREATE
  ========================= */

  const handleCreateClick =
    async () => {
      try {
        const res =
          await axios.get(
            "/api/check-course-limit"
          );

        if (
          res.data.allowed
        ) {
          setOpenDialog(true);
        } else {
          toast.warning(
            "Free users can only create one course."
          );

          router.push(
            "/workspace/billing"
          );
        }
      } catch (err) {
        toast.error(
          "Failed to check access"
        );
      }
    };

  return (
    <Sidebar
      className="
        border-r
        border-emerald-100
        dark:border-gray-800

        bg-white/95
        dark:bg-gray-950/95

        backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <SidebarHeader
        className="
          p-4
          sm:p-5

          border-b
          border-emerald-100
          dark:border-gray-800
        "
      >
        <div className="flex justify-center">

          <Image
            src="/logo.svg"
            alt="logo"
            width={250}
            height={300}
            className="
              w-full
              h-auto

              max-w-[180px]
              sm:max-w-[220px]

              object-contain
            "
            priority
          />

        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent
        className="
          px-3
          py-4

          overflow-x-hidden
        "
      >
        {/* CREATE BUTTON */}
        <SidebarGroup>

          <AddNewCourseDialogue
            open={openDialog}
            setOpen={
              setOpenDialog
            }
          >
            <Button
              onClick={
                handleCreateClick
              }
              className="
                w-full

                h-12

                rounded-2xl

                bg-gradient-to-r
                from-emerald-500
                to-green-600

                hover:from-emerald-600
                hover:to-green-700

                text-white

                text-sm
                sm:text-base

                font-semibold

                shadow-lg
                hover:shadow-xl

                transition-all
                duration-300
              "
            >
              <Sparkles className="w-4 h-4 mr-2" />

              Create New Course
            </Button>
          </AddNewCourseDialogue>

        </SidebarGroup>

        {/* MENU */}
        <SidebarGroup className="mt-5">

          <SidebarGroupContent>

            <SidebarMenu className="space-y-2">

              {SideBarOptions.map(
                (
                  item,
                  index
                ) => {
                  const isActive =
                    path ===
                    item.path;

                  return (
                    <SidebarMenuItem
                      key={index}
                    >
                      <SidebarMenuButton
                        asChild
                        className="
                          p-0

                          h-auto
                        "
                      >
                        <Link
                          href={
                            item.path
                          }
                          className={`
                            group

                            flex
                            items-center

                            gap-3

                            px-4
                            py-3

                            rounded-2xl

                            transition-all
                            duration-300

                            overflow-hidden

                            ${
                              isActive
                                ? `
                                  bg-emerald-100
                                  dark:bg-emerald-500/15

                                  text-emerald-700
                                  dark:text-emerald-300

                                  shadow-sm

                                  border
                                  border-emerald-200
                                  dark:border-emerald-500/20
                                `
                                : `
                                  text-gray-700
                                  dark:text-gray-300

                                  hover:bg-emerald-50
                                  dark:hover:bg-gray-900
                                `
                            }
                          `}
                        >
                          {/* ICON */}
                          <div
                            className={`
                              flex
                              items-center
                              justify-center

                              rounded-xl

                              transition-all

                              ${
                                isActive
                                  ? `
                                    bg-white
                                    dark:bg-gray-800

                                    shadow-sm
                                  `
                                  : `
                                    bg-gray-100
                                    dark:bg-gray-800

                                    group-hover:bg-white
                                    dark:group-hover:bg-gray-700
                                  `
                              }

                              p-2
                            `}
                          >
                            <item.icon
                              className="
                                h-5
                                w-5

                                sm:h-5
                                sm:w-5
                              "
                            />
                          </div>

                          {/* TITLE */}
                          <span
                            className="
                              text-sm
                              sm:text-[15px]

                              font-semibold

                              truncate
                            "
                          >
                            {
                              item.title
                            }
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              )}

            </SidebarMenu>

          </SidebarGroupContent>

        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter
        className="
          border-t
          border-emerald-100
          dark:border-gray-800

          p-4

          text-center

          text-xs

          text-gray-400
          dark:text-gray-500
        "
      >
        Build by Nidhi(22134501005)
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;