import fs from "fs";
import matter from "gray-matter";
import { Metadata } from "next";
import path from "path";
import { notFound } from "next/navigation";
import { BlogPostContent } from "./BlogPostContent";
import { LadderlyPageWrapper } from "~/app/core/components/page-wrapper/LadderlyPageWrapper";
import { remark } from "remark";
import { visit } from "unist-util-visit";

// This generates static params for all blog posts at build time
export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "src/app/blog"));
  const paths = files
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => ({
      slug: filename.replace(".md", ""),
    }));

  return paths;
}

// This generates metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

async function getTableOfContents(
  content: string
): Promise<TableOfContentsItem[]> {
  const toc: TableOfContentsItem[] = [];

  const tree = await remark().parse(content);

  visit(tree, "heading", (node: any) => {
    const text = node.children
      .filter((child: any) => child.type === "text")
      .map((child: any) => child.value)
      .join("");

    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    toc.push({
      id,
      text,
      level: node.depth,
    });
  });

  return toc;
}

async function getBlogPost(slug: string) {
  const markdownFile = path.join(process.cwd(), "src/app/blog", `${slug}.md`);

  if (!fs.existsSync(markdownFile)) {
    return null;
  }

  const fileContents = fs.readFileSync(markdownFile, "utf8");
  const { data, content } = matter(fileContents);

  // Get first paragraph as excerpt
  const excerpt = content.split("\n\n")[0];
  const toc = await getTableOfContents(content);

  return {
    slug,
    title: data.title,
    date: data.date,
    author: data.author,
    content,
    excerpt,
    toc,
  };
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <LadderlyPageWrapper>
      <article className="prose prose-lg prose-violet mx-auto max-w-3xl px-4">
        <header className="mb-8 border-b border-ladderly-light-purple-2 pb-8 text-center">
          <h1 className="mt-4 mb-0 text-3xl font-bold text-ladderly-violet-600">
            {post.title}
          </h1>
          <p className="my-0 text-gray-600">
            Published on {post.date} by {post.author}
          </p>
        </header>

        {post.toc.length > 0 && (
          <section className="mb-8 rounded-lg bg-ladderly-light-purple-1 p-4 shadow-lg">
            <h2 className="mb-2 text-xl font-bold text-ladderly-violet-600">
              Table of Contents
            </h2>
            <ul className="list-none pl-0">
              {post.toc.map((item) => (
                <li
                  key={item.id}
                  style={{ marginLeft: `${(item.level - 1) * 20}px` }}
                  className="my-1"
                >
                  <a
                    href={`#${item.id}`}
                    className="text-ladderly-violet-500 hover:text-ladderly-violet-600"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <BlogPostContent content={post.content} toc={post.toc} />
      </article>
    </LadderlyPageWrapper>
  );
}
