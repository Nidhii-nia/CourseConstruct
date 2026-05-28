"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function BlockRenderer({ blocks }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  /* ======================================================
     UNIFIED MATH FORMATTER - Handles all LaTeX formats
  ====================================================== */
  
  const formatContent = (content = "") => {
    // First, unescape HTML entities
    let formatted = content
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Fix double backslashes
    formatted = formatted.replace(/\\\\/g, "\\");

    // Convert \( ... \) to $ ... $ (inline math)
    formatted = formatted.replace(
      /\\\((.*?)\\\)/gs,
      (_, math) => `$${math.trim()}$`
    );

    // Convert \[ ... \] to $$ ... $$ (display math)
    formatted = formatted.replace(
      /\\\[(.*?)\\\]/gs,
      (_, math) => `\n$$\n${math.trim()}\n$$\n`
    );

    // Convert \displaystyle within inline math to display math
    formatted = formatted.replace(
      /\$\\displaystyle\s+([^$]+)\$/g,
      (_, math) => `\n$$\n${math.trim()}\n$$\n`
    );

    // Fix cases where $ is escaped
    formatted = formatted.replace(/\\\$/g, "$");

    // Ensure proper spacing around display math
    formatted = formatted.replace(/\$\$\s*\n\s*([\s\S]*?)\s*\n\s*\$\$/g, (_, math) => {
      return `\n$$\n${math.trim()}\n$$\n`;
    });

    return formatted;
  };

  // Custom component to handle math properly
  const MathRenderer = ({ children }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeKatex, { 
            strict: false,
            throwOnError: false,
            output: 'html'
          }],
        ]}
      >
        {children}
      </ReactMarkdown>
    );
  };

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        /* HEADING */
        if (block.type === "heading") {
          return (
            <h2
              key={index}
              className="
                text-2xl md:text-3xl font-bold
                text-emerald-700 dark:text-emerald-300
                mt-8 mb-4 leading-tight
              "
            >
              <MathRenderer>{formatContent(block.value)}</MathRenderer>
            </h2>
          );
        }

        /* TEXT */
        if (block.type === "text") {
          return (
            <div
              key={index}
              className="
                course-content prose prose-emerald dark:prose-invert
                max-w-none wrap-break-word overflow-hidden
                prose-pre:overflow-x-auto prose-code:wrap-break-word prose-img:max-w-full
                prose-table:block prose-table:overflow-x-auto prose-p:leading-8
                prose-headings:text-emerald-700 dark:prose-headings:text-emerald-300
              "
            >
              <MathRenderer>{formatContent(block.value)}</MathRenderer>
            </div>
          );
        }

        /* LIST */
        if (block.type === "list") {
          return (
            <ul
              key={index}
              className="
                list-disc pl-6 space-y-2 text-base leading-7
                text-gray-800 dark:text-gray-200
              "
            >
              {block.items?.map((item, i) => (
                <li key={i}>
                  <MathRenderer>{formatContent(item)}</MathRenderer>
                </li>
              ))}
            </ul>
          );
        }

        /* MATH BLOCK */
        if (block.type === "math") {
          return (
            <div
              key={index}
              className="
                overflow-x-auto rounded-2xl
                bg-emerald-50 dark:bg-gray-900
                border border-emerald-100 dark:border-emerald-500/20
                p-5 shadow-sm
              "
            >
              <MathRenderer>{`$$\n${formatContent(block.value)}\n$$`}</MathRenderer>
            </div>
          );
        }

        /* CODE */
        if (block.type === "code") {
          return (
            <div
              key={index}
              className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <SyntaxHighlighter language={block.language || "javascript"}>
                {block.value}
              </SyntaxHighlighter>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}