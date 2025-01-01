"use client";

import ReactMarkdown from "react-markdown";
import { TableOfContentsItem } from "./types";

interface BlogPostContentProps {
  content: string;
  toc: TableOfContentsItem[];
}

export function BlogPostContent({ content, toc }: BlogPostContentProps) {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        h1: ({ children }) => {
          const text = children?.toString() || "";
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return <h1 id={id}>{children}</h1>;
        },
        h2: ({ children }) => {
          const text = children?.toString() || "";
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return <h2 id={id}>{children}</h2>;
        },
        h3: ({ children }) => {
          const text = children?.toString() || "";
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return <h3 id={id}>{children}</h3>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
