"use client";

import * as React from "react";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

/* =========================================
   ROOT
========================================= */

function AlertDialog({
  ...props
}) {
  return (
    <AlertDialogPrimitive.Root
      data-slot="alert-dialog"
      {...props}
    />
  );
}

/* =========================================
   TRIGGER
========================================= */

function AlertDialogTrigger({
  ...props
}) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      {...props}
    />
  );
}

/* =========================================
   PORTAL
========================================= */

function AlertDialogPortal({
  ...props
}) {
  return (
    <AlertDialogPrimitive.Portal
      data-slot="alert-dialog-portal"
      {...props}
    />
  );
}

/* =========================================
   OVERLAY
========================================= */

function AlertDialogOverlay({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        `
          fixed
          inset-0
          z-50

          bg-black/50
          backdrop-blur-sm

          data-[state=open]:animate-in
          data-[state=closed]:animate-out

          data-[state=open]:fade-in-0
          data-[state=closed]:fade-out-0
        `,
        className
      )}
      {...props}
    />
  );
}

/* =========================================
   CONTENT
========================================= */

function AlertDialogContent({
  className,
  size = "default",
  ...props
}) {
  return (
    <AlertDialogPortal>

      <AlertDialogOverlay />

      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          `
            fixed
            left-1/2
            top-1/2
            z-50

            w-[95vw]
            max-w-[95vw]

            translate-x-[-50%]
            translate-y-[-50%]

            rounded-3xl

            border
            border-gray-200
            dark:border-gray-700

            bg-white
            dark:bg-gray-950

            p-6
            sm:p-7

            shadow-2xl

            duration-200

            grid
            gap-5

            overflow-hidden

            data-[state=open]:animate-in
            data-[state=closed]:animate-out

            data-[state=open]:fade-in-0
            data-[state=closed]:fade-out-0

            data-[state=open]:zoom-in-95
            data-[state=closed]:zoom-out-95

            data-[size=sm]:sm:max-w-sm
            data-[size=default]:sm:max-w-lg
            data-[size=lg]:sm:max-w-2xl
          `,
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

/* =========================================
   HEADER
========================================= */

function AlertDialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        `
          flex
          flex-col

          gap-2

          text-center
          sm:text-left
        `,
        className
      )}
      {...props}
    />
  );
}

/* =========================================
   FOOTER
========================================= */

function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        `
          flex
          flex-col-reverse
          sm:flex-row

          gap-3

          sm:justify-end
        `,
        className
      )}
      {...props}
    />
  );
}

/* =========================================
   TITLE
========================================= */

function AlertDialogTitle({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        `
          text-xl
          font-bold

          tracking-tight

          text-gray-900
          dark:text-white
        `,
        className
      )}
      {...props}
    />
  );
}

/* =========================================
   DESCRIPTION
========================================= */

function AlertDialogDescription({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        `
          text-sm

          leading-relaxed

          text-gray-500
          dark:text-gray-400
        `,
        className
      )}
      {...props}
    />
  );
}

/* =========================================
   MEDIA
========================================= */

function AlertDialogMedia({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        `
          mx-auto
          sm:mx-0

          flex
          items-center
          justify-center

          w-16
          h-16

          rounded-2xl

          bg-gray-100
          dark:bg-gray-800

          text-gray-700
          dark:text-gray-300

          shrink-0

          *:[svg]:w-8
          *:[svg]:h-8
        `,
        className
      )}
      {...props}
    />
  );
}

/* =========================================
   ACTION
========================================= */

function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <Button
      variant={variant}
      size={size}
      asChild
      className="
        rounded-2xl

        shadow-sm
        hover:shadow-md

        transition-all
      "
    >
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  );
}

/* =========================================
   CANCEL
========================================= */

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}) {
  return (
    <Button
      variant={variant}
      size={size}
      asChild
      className="
        rounded-2xl

        transition-all
      "
    >
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  );
}

/* =========================================
   EXPORTS
========================================= */

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};