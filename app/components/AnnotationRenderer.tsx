"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useEffect, useState } from "react";

interface AnnotationRendererProps {
  content: string;
}

export function AnnotationRenderer({ content }: AnnotationRendererProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Obsidian sempre usa dark theme
    setIsDark(true);
  }, []);

  return (
    <div className="annotation-content text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0 text-[#d4d4d4]">{children}</p>,
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-[#cccccc]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0 text-[#cccccc]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold mb-2 mt-3 first:mt-0 text-[#cccccc]">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 text-[#d4d4d4]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 text-[#d4d4d4]">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1 text-[#d4d4d4]">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#007acc] pl-4 italic mb-3 text-[#ce9178]">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#cccccc]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-[#d4d4d4]">{children}</em>,
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            return !inline && language ? (
              <div className="my-2">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  customStyle={{ borderRadius: "4px", fontSize: "0.875rem", background: "#1e1e1e" }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-[#252526] px-1.5 py-0.5 rounded text-xs text-[#4ec9b0]"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
