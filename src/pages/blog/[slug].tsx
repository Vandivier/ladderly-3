import fs from "fs"
import matter from "gray-matter"
import { GetStaticPaths, GetStaticProps } from "next"
import path from "path"
import { Suspense } from "react"
import rehypeStringify from "rehype-stringify"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import styles from "src/styles/Home.module.css"
import { unified } from "unified"

import { TopNavContent } from "../index"

const BlogPost = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className={styles.container}>
      <div className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
        <Suspense fallback="">
          <TopNavContent />
        </Suspense>
      </div>

      <main className={styles.main}>
        <h1 className="p-4 text-3xl text-ladderly-violet-600">{title}</h1>
        <article
          className="prose prose-lg max-w-none px-4 text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://discord.gg/fAg6Xa4uxc"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textLink}
        >
          Discord
        </a>
        <a
          href="https://github.com/Vandivier/ladderly-3#about"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textLink}
        >
          GitHub
        </a>
        <p>Copyright © 2023 John Vandivier</p>
      </footer>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join("src/pages/blog"))
  const paths = files
    .filter((filename) => path.extname(filename) === ".md")
    .map((filename) => ({
      params: {
        slug: filename.replace(".md", ""),
      },
    }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || typeof params.slug !== "string") {
    return { notFound: true }
  }

  const slug = params.slug
  const markdownWithMetadata = fs.readFileSync(path.join("src/pages/blog", slug + ".md")).toString()

  const { data, content } = matter(markdownWithMetadata)

  const htmlContent = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return {
    props: {
      title: data.title,
      content: htmlContent.toString(),
    },
  }
}

export default BlogPost
