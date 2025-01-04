"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface BlogPostContentProps {
  content: string;
}

export function BlogPostContent({ content }: BlogPostContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <div className="my-8 flex justify-center">
            <Image
              src={src ?? ""}
              alt={alt ?? ""}
              width={540}
              height={300}
              className="rounded-lg"
            />
          </div>
        ),
        h1: ({ children }) => {
          const text = children?.toString() ?? "";
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return <h1 id={id}>{children}</h1>;
        },
        h2: ({ children }) => {
          const text = children?.toString() ?? "";
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return <h2 id={id}>{children}</h2>;
        },
        h3: ({ children }) => {
          const text = children?.toString() ?? "";
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return <h3 id={id}>{children}</h3>;
        },
        table: ({ children }) => (
          <div className="my-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {children}
            </table>
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
