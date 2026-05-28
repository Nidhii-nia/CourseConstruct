"use client";

import React from "react";

export default function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden w-full rounded-3xl border border-emerald-200 dark:border-gray-700 bg-gradient-to-r from-emerald-950 via-cyan-900 to-cyan-700 dark:from-gray-950 dark:via-emerald-950 dark:to-cyan-950 text-white shadow-2xl px-5 sm:px-7 md:px-10 py-6 sm:py-8 md:py-10">

      {/* Glow Effects */}
      <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-cyan-400 opacity-20 blur-3xl"></div>

      <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-emerald-400 opacity-20 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">

        <h2 className="font-black tracking-tight leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
          Welcome to{" "}
          <span className="inline-block bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent animate-shimmer">
            CourseConstruct
          </span>
        </h2>

        <p className="mt-4 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-emerald-100">
          Learn. Construct. Teach what you love.
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }

          100% {
            background-position: 200% center;
          }
        }

        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

    </div>
  );
}