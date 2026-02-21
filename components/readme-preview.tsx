"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReadmePreviewProps {
  content: string;
}

export function ReadmePreview({ content }: ReadmePreviewProps) {
  return (
    <div className="prose prose-sm prose-invert max-w-none [&_a]:text-primary [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_img]:rounded-md [&_table]:border-border [&_th]:border-border [&_td]:border-border">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
