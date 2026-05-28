"use client";

import * as React from "react";

import { cva } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

/* =========================================
   BUTTON VARIANTS
========================================= */

const buttonVariants = cva(

  `
    inline-flex

    shrink-0

    items-center
    justify-center

    gap-2

    whitespace-nowrap

    rounded-2xl

    text-sm
    font-semibold

    transition-all
    duration-200

    outline-none

    focus-visible:ring-2
    focus-visible:ring-emerald-500/40

    disabled:pointer-events-none
    disabled:opacity-50

    active:scale-[0.98]

    shadow-sm
    hover:shadow-md

    [&_svg]:pointer-events-none
    [&_svg]:shrink-0

    [&_svg:not([class*='size-'])]:size-4
  `,

  {
    variants: {

      variant: {

        /* =========================
           DEFAULT
        ========================= */

        default: `
          bg-emerald-600

          text-white

          hover:bg-emerald-700

          dark:bg-emerald-600
          dark:hover:bg-emerald-500
        `,

        /* =========================
           DESTRUCTIVE
        ========================= */

        destructive: `
          bg-red-600

          text-white

          hover:bg-red-700

          dark:bg-red-700
          dark:hover:bg-red-600
        `,

        /* =========================
           OUTLINE
        ========================= */

        outline: `
          border
          border-gray-200
          dark:border-gray-700

          bg-white
          dark:bg-gray-900

          text-gray-800
          dark:text-gray-200

          hover:bg-gray-100
          dark:hover:bg-gray-800
        `,

        /* =========================
           SECONDARY
        ========================= */

        secondary: `
          bg-gray-100
          dark:bg-gray-800

          text-gray-900
          dark:text-gray-100

          hover:bg-gray-200
          dark:hover:bg-gray-700
        `,

        /* =========================
           GHOST
        ========================= */

        ghost: `
          bg-transparent

          text-gray-700
          dark:text-gray-300

          hover:bg-gray-100
          dark:hover:bg-gray-800
        `,

        /* =========================
           LINK
        ========================= */

        link: `
          bg-transparent

          text-emerald-600
          dark:text-emerald-400

          underline-offset-4

          hover:underline

          shadow-none
          hover:shadow-none
        `,
      },

      /* =====================================
         SIZES
      ===================================== */

      size: {

        default: `
          h-10

          px-5
          py-2
        `,

        xs: `
          h-7

          rounded-xl

          px-2.5

          text-xs
        `,

        sm: `
          h-9

          rounded-xl

          px-4

          text-sm
        `,

        lg: `
          h-12

          rounded-2xl

          px-8

          text-base
        `,

        icon: `
          h-10
          w-10
        `,

        "icon-xs": `
          h-7
          w-7

          rounded-xl
        `,

        "icon-sm": `
          h-9
          w-9
        `,

        "icon-lg": `
          h-12
          w-12
        `,
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/* =========================================
   BUTTON COMPONENT
========================================= */

function Button({

  className,

  variant = "default",

  size = "default",

  asChild = false,

  ...props

}) {

  const Comp =
    asChild
      ? Slot
      : "button";

  return (
    <Comp

      data-slot="button"

      data-variant={variant}

      data-size={size}

      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        })
      )}

      {...props}
    />
  );
}

export {
  Button,
  buttonVariants,
};