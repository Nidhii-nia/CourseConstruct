"use client";

import * as React from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* =========================================
   ROOT
========================================= */

function Dialog({
  ...props
}) {
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      {...props}
    />
  );
}

/* =========================================
   TRIGGER
========================================= */

function DialogTrigger({
  ...props
}) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
    />
  );
}

/* =========================================
   PORTAL
========================================= */

function DialogPortal({
  ...props
}) {
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      {...props}
    />
  );
}

/* =========================================
   CLOSE
========================================= */

function DialogClose({
  ...props
}) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
    />
  );
}

/* =========================================
   OVERLAY
========================================= */

function DialogOverlay({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
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

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogPortal data-slot="dialog-portal">

      <DialogOverlay />

      <DialogPrimitive.Content
        data-slot="dialog-content"
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

            shadow-2xl

            p-5
            sm:p-7

            grid
            gap-5

            overflow-hidden

            duration-200

            data-[state=open]:animate-in
            data-[state=closed]:animate-out

            data-[state=open]:fade-in-0
            data-[state=closed]:fade-out-0

            data-[state=open]:zoom-in-95
            data-[state=closed]:zoom-out-95

            sm:max-w-lg
            md:max-w-xl
          `,
          className
        )}
        {...props}
      >
        {children}

        {/* CLOSE BUTTON */}
        {showCloseButton && (

          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="
              absolute
              right-4
              top-4

              inline-flex
              items-center
              justify-center

              rounded-xl

              p-2

              text-gray-500
              dark:text-gray-400

              transition-all

              hover:bg-gray-100
              dark:hover:bg-gray-800

              hover:text-gray-800
              dark:hover:text-white

              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500/40
            "
          >
            <XIcon className="h-5 w-5" />

            <span className="sr-only">
              Close
            </span>

          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/* =========================================
   HEADER
========================================= */

function DialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-header"
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

function DialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
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

function DialogTitle({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
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

function DialogDescription({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
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
   EXPORTS
========================================= */

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};