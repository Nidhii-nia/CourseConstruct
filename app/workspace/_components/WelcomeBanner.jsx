"use client";
import React from "react";

export default function WelcomeBanner() {
  return (
    <div className="w-full p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-linear-to-r from-emerald-950 via-cyan-900 to-cyan-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight">
          Welcome to{" "}
          <span className="relative bg-linear-to-r from-amber-500 via-white to-amber-500 bg-clip-text text-transparent animate-shimmer">
            CourseConstruct
          </span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-amber-200 opacity-90 mt-2 sm:mt-3">
          Learn. Construct. Teach what you love.
        </p>

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
    </div>
  );
}