'use client';

import { useState, useEffect } from 'react';
import {
  usePathname,
  useSearchParams,
} from 'next/navigation';

/* =======================
   GLOBAL API TRACKER
======================= */
const apiTracker = {
  pendingRequests: 0,

  isPageReady: false,

  listeners: new Set(),

  addRequest() {
    if (!this.isPageReady) {
      this.pendingRequests++;

      this.notify(true);
    }
  },

  removeRequest() {
    if (!this.isPageReady) {
      this.pendingRequests = Math.max(
        0,
        this.pendingRequests - 1
      );

      if (
        this.pendingRequests === 0
      ) {
        setTimeout(() => {
          this.notify(false);

          this.markPageReady();
        }, 300);
      }
    }
  },

  notify(isLoading) {
    this.listeners.forEach((l) =>
      l(isLoading)
    );
  },

  markPageReady() {
    this.isPageReady = true;

    this.pendingRequests = 0;
  },

  resetForNewRoute() {
    this.isPageReady = false;

    this.pendingRequests = 0;
  },
};

/* =======================
   EXPORTED CONTROLS
======================= */

export function startLoading() {
  if (!apiTracker.isPageReady) {
    apiTracker.addRequest();
  }
}

export function stopLoading() {
  if (!apiTracker.isPageReady) {
    apiTracker.removeRequest();
  }
}

export function RouteLoading(
  isLoading
) {
  if (
    isLoading &&
    !apiTracker.isPageReady
  ) {
    apiTracker.addRequest();
  } else if (
    !apiTracker.isPageReady
  ) {
    apiTracker.removeRequest();
  }
}

/* =======================
   FETCH MONKEY PATCH
======================= */

if (typeof window !== 'undefined') {
  window.__apiTracker =
    apiTracker;

  const originalFetch =
    window.fetch;

  window.fetch = function (
    ...args
  ) {
    if (
      !apiTracker.isPageReady
    ) {
      apiTracker.addRequest();

      const timeout =
        setTimeout(() => {
          apiTracker.removeRequest();
        }, 3000);

      return originalFetch
        .apply(this, args)
        .then((res) => {
          clearTimeout(timeout);

          apiTracker.removeRequest();

          return res;
        })
        .catch((err) => {
          clearTimeout(timeout);

          apiTracker.removeRequest();

          throw err;
        });
    }

    return originalFetch.apply(
      this,
      args
    );
  };
}

/* =======================
   MAIN COMPONENT
======================= */

export default function RouteLoaderInner() {
  const [isLoading, setIsLoading] =
    useState(false);

  const [apiLoading, setApiLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  /* =======================
     API LISTENER
  ======================= */

  useEffect(() => {
    const handle = (
      loading
    ) => {
      setApiLoading(loading);

      setProgress(
        loading ? 30 : 100
      );

      if (!loading) {
        setTimeout(() => {
          setProgress(0);
        }, 300);
      }
    };

    apiTracker.listeners.add(
      handle
    );

    return () =>
      apiTracker.listeners.delete(
        handle
      );
  }, []);

  /* =======================
     ROUTE CHANGE
  ======================= */

  useEffect(() => {
    setIsLoading(true);

    setProgress(10);

    apiTracker.resetForNewRoute();

    let mounted = true;

    const isReady = () =>
      document.readyState ===
        'complete' &&
      Array.from(
        document.images
      ).every((img) => img.complete) &&
      apiTracker.pendingRequests ===
        0;

    const hideLoader = () => {
      if (
        !mounted ||
        !isReady()
      )
        return;

      setProgress(100);

      setTimeout(() => {
        if (mounted) {
          setIsLoading(false);

          setProgress(0);

          apiTracker.markPageReady();
        }
      }, 300);
    };

    let interval;

    if (
      isLoading ||
      apiLoading
    ) {
      interval = setInterval(() => {
        setProgress((p) =>
          p < 90 ? p + 10 : p
        );
      }, 200);
    }

    const onLoad = () =>
      setTimeout(
        hideLoader,
        300
      );

    if (
      document.readyState ===
      'complete'
    ) {
      onLoad();
    } else {
      window.addEventListener(
        'load',
        onLoad
      );
    }

    const initial =
      setTimeout(
        hideLoader,
        500
      );

    return () => {
      mounted = false;

      clearInterval(interval);

      clearTimeout(initial);

      window.removeEventListener(
        'load',
        onLoad
      );
    };
  }, [
    pathname,
    searchParams,
  ]);

  /* =======================
     HIDE IF READY
  ======================= */

  if (apiTracker.isPageReady)
    return null;

  if (
    !isLoading &&
    !apiLoading &&
    progress === 0
  )
    return null;

  return (
    <>
      {/* =======================
          TOP LOADING BAR
      ======================= */}

      <div
        className="
          fixed
          top-0
          left-0
          right-0

          h-1

          z-9999

          bg-gray-200/70
          dark:bg-gray-800/70

          backdrop-blur-sm
        "
      >
        <div
          className="
            h-full

            bg-gradient-to-r
            from-blue-500
            via-purple-500
            to-pink-500

            transition-all
            duration-300

            shadow-[0_0_20px_rgba(168,85,247,0.7)]
          "
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* =======================
          API INDICATOR
      ======================= */}

      {apiLoading && (
        <div
          className="
            fixed
            top-4
            right-4

            z-9999
          "
        >
          <div
            className="
              flex
              items-center
              gap-2

              px-4
              py-2

              rounded-full

              bg-white/80
              dark:bg-gray-900/80

              backdrop-blur-xl

              shadow-xl

              border
              border-gray-200
              dark:border-gray-700

              transition-all
              duration-300
            "
          >
            {/* SPINNER */}
            <div
              className="
                w-3.5
                h-3.5

                border-2

                border-blue-500
                border-t-transparent

                rounded-full

                animate-spin
              "
            />

            {/* TEXT */}
            <span
              className="
                text-xs
                font-medium

                text-gray-700
                dark:text-gray-200
              "
            >
              Loading...
            </span>
          </div>
        </div>
      )}
    </>
  );
}