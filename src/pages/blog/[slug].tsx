import { GetStaticPaths, GetStaticProps } from "next"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
// import remark from "remark"
import * as remark from "remark"
import html from "remark-html"

const BlogPost = ({ title, content }: { title: string; content: string }) => {
  return (
    <div>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join("src/pages/blog"))
  const paths = files.map((filename) => ({
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

  const htmlContent = await remark().use(html).process(content)

  return {
    props: {
      title: data.title,
      content: htmlContent.toString(),
    },
  }
}

export default BlogPost
