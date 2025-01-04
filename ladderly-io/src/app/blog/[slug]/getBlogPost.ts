import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

const tipUrl =
  'https://checkout.stripe.com/c/pay/cs_live_a10YyjvS4xEbZJ9Th74ZTitGd2NZoHBILwU0K8AdL1P5INh5a9ry7h1Bj9#fidkdWxOYHwnPyd1blppbHNgWlIzUk5qNVddT2AyYGM8PURQN01fTUFSYjU1bX9nPX1KZ1InKSd1aWxrbkB9dWp2YGFMYSc%2FJ2BTZDxAMjdgYmBpQ2NWYmNcXycpJ3dgY2B3d2B3SndsYmxrJz8nbXFxdXY%2FKipycnIraWRhYWB3aXwrbGoqJ3gl'

const sBlogCallToAction = `<p class="call-to-action"
  style="font-size: 1rem; font-style: italic; margin: 0 auto;">

    Thanks for reading! Ladderly is open source and community driven.
    Consider supporting the maintainers by
    <a href="${tipUrl}" target="_blank">
      leaving a tip!
    </a>
  </p>`

export async function getBlogPost(
  slug: string
): Promise<{ title: string; content: string; toc: TableOfContentsItem[] }> {
  const markdownWithMetadata = fs
    .readFileSync(path.join(process.cwd(), 'src/app/blog', `${slug}.md`))
    .toString()

  const { data, content } = matter(markdownWithMetadata)

  const toc: TableOfContentsItem[] = []

  const addStylesAndClasses = () => {
    return (tree: Root) => {
      visit(tree, 'element', (node: Element) => {
        if (/^h[1-6]$/.test(node.tagName)) {
          if (!node.properties) node.properties = {}
          if (!node.properties.className) node.properties.className = []
          ;(node.properties.className as string[]).push('font-bold')

          if (node.properties.id && typeof node.properties.id === 'string') {
            let headingText = ''
            visit(node, 'text', (textNode) => {
              headingText += textNode.value
            })

            toc.push({
              id: node.properties.id,
              text: headingText,
              level: parseInt(node.tagName.charAt(1)),
            })
          }

          if (node.children && node.children.length > 0) {
            const firstChild = node.children[0] as Element
            if (firstChild.tagName === 'a') {
              if (!firstChild.properties) firstChild.properties = {}
              if (!firstChild.properties.className) {
                firstChild.properties.className = []
                firstChild.properties.className.push('font-bold')
              }
            }
          }
        }

        if (node.tagName === 'a') {
          if (!node.properties) node.properties = {}
          if (!node.properties.className) node.properties.className = []
          ;(node.properties.className as string[]).push(
            'no-underline',
            'hover:underline'
          )
        }

        if (node.tagName === 'table') {
          if (!node.properties) node.properties = {}
          if (!node.properties.className) node.properties.className = []
          ;(node.properties.className as string[]).push(
            'min-w-full',
            'border-collapse',
            'text-left',
            'text-sm',
            'my-4'
          )
        }

        if (node.tagName === 'th' || node.tagName === 'td') {
          if (!node.properties) node.properties = {}
          if (!node.properties.className) node.properties.className = []
          ;(node.properties.className as string[]).push(
            'px-4',
            'py-2',
            'border',
            'border-gray-300'
          )
        }
      })
    }
  }

  const htmlContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeExternalLinks, { target: '_blank' })
    .use(rehypeHighlight, {
      subset: ['javascript', 'typescript', 'css', 'html', 'python', 'java'],
    })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
    })
    .use(addStylesAndClasses)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  const updatedHtml = htmlContent
    .toString()
    .replaceAll('{{ BlogCallToAction }}', sBlogCallToAction)

  return {
    title: data.title,
    content: updatedHtml,
    toc,
  }
}
