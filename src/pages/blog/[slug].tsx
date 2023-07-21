import fs from "fs"
import matter from "gray-matter"
import { GetStaticPaths, GetStaticProps } from "next"
import path from "path"
import rehypeStringify from "rehype-stringify"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

import styles from "./Blog.module.css"

const BlogPost = ({ title, content }: { title: string; content: string }) => {
  return (
    <div>
      <h1>{title}</h1>
      <div className={styles["blog-content"]} dangerouslySetInnerHTML={{ __html: content }} />
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
