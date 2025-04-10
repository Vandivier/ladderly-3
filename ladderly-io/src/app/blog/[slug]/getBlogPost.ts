import fs from 'fs'
import matter from 'gray-matter'
import type {
  Element as HastElement,
  Properties as HastProperties,
  Root as HastRoot,
} from 'hast'
import type { Node as MdastNode, Root as MdastRoot, Parent } from 'mdast'
import path from 'path'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified, type Plugin } from 'unified'
import { visit } from 'unist-util-visit'

// Define the TableOfContentsItem interface
export interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

// Interface for nodes created by remark-directive
interface DirectiveNode extends Parent {
  type: 'textDirective' | 'leafDirective' | 'containerDirective'
  name: string
  attributes?: Record<string, string>
  // Ensure data property and its sub-properties are properly typed/optional
  data?: {
    hName?: string
    hProperties?: HastProperties // Use HastProperties type
    hChildren?: Array<HastNode> // Use a more specific HAST node type if available
    [key: string]: unknown // Allow other potential data properties
  }
}
// Define a simple HastNode type for children if needed, or use any for now if complex
type HastNode = any

// Helper function to set HAST properties for the :a directive
function handleAnchorDirectiveHast(directive: DirectiveNode) {
  const attributes = directive.attributes ?? {}
  const href = attributes.href ?? '#'
  const id = attributes.id
  // Don't delete id from original attributes, create new properties object
  const hProperties: HastProperties = { ...attributes, id }

  // Set hName and hProperties on the directive node's data
  // remark-rehype will use these when converting the node
  const data = directive.data ?? (directive.data = {})
  data.hName = 'a' // Tell rehype to create an <a> tag
  data.hProperties = hProperties // Pass the attributes
  // DO NOT set data.hChildren - let rehype handle child conversion

  // Add target/rel to the hProperties directly
  if (typeof href === 'string' && href.startsWith('http')) {
    hProperties.target = '_blank'
    hProperties.rel = 'noopener noreferrer'
  }

  // Add data-premium-link to hProperties
  if (href === 'PREMIUM_SIGNUP_LINK') {
    hProperties['data-premium-link'] = 'true'
  }
}

// Custom plugin for Remark directives
const transformDirectivesPlugin: Plugin<[], MdastRoot> = () => {
  // List of directive types we are interested in
  const directiveTypes = [
    'textDirective',
    'leafDirective',
    'containerDirective',
  ]

  return (tree: MdastRoot) => {
    visit(tree, (node: MdastNode) => {
      // Check if the node type is one of the directive types using .includes()
      if (directiveTypes.includes(node.type)) {
        // Cast to DirectiveNode is safe here because we checked the type
        const directive = node as DirectiveNode
        if (directive.name === 'a') {
          handleAnchorDirectiveHast(directive)
        }
      }
    })
  }
}

// Custom rehype plugin to make all external links open in a new tab
const addTargetBlankToLinks: Plugin<[], HastRoot> = () => {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: HastElement) => {
      if (node.tagName === 'a') {
        const props = node.properties ?? {}
        const href = props.href

        // Skip fragment links (starting with #)
        if (
          typeof href === 'string' &&
          !href.startsWith('#') &&
          !href.startsWith('javascript:')
        ) {
          // Add target and rel attributes for external links
          if (
            href.startsWith('http') ||
            href.startsWith('https') ||
            href.startsWith('//')
          ) {
            props.target = '_blank'
            props.rel = 'noopener noreferrer'
          }
        }

        node.properties = props
      }
    })
  }
}

// Function to extract table of contents from markdown content
function extractTableOfContents(content: string): TableOfContentsItem[] {
  const toc: TableOfContentsItem[] = []

  // Use a more direct regex to find all headings in the content
  const headingRegex = /^(#{1,6})\s+(.+)$/gm

  let match
  while ((match = headingRegex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      const level = match[1].length
      const text = match[2].trim()

      // Create a URL-friendly ID from the heading text
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens

      toc.push({
        id,
        text,
        level,
      })
    }
  }

  return toc
}

// Function to add IDs to headings in HTML content based on TOC
function addIdsToHeadings(
  contentHtml: string,
  toc: TableOfContentsItem[],
): string {
  if (!contentHtml || !toc || toc.length === 0) return contentHtml || ''

  // Process each TOC item
  toc.forEach((item) => {
    if (!item || !item.text || !item.id) return

    // Escape special regex characters in the heading text
    const escapedText = item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Create regex to find the heading tag with the exact text
    // This looks for h1-h6 tags that contain the exact text of the TOC item
    const regex = new RegExp(
      `(<h[1-6])([^>]*)>(${escapedText})(</h[1-6]>)`,
      'g',
    )

    // Replace with the same tag but with an id attribute
    // If the tag already has attributes, we add the id to them
    // Otherwise, we add the id as a new attribute
    contentHtml = contentHtml.replace(
      regex,
      (match, openTag, attrs, text, closeTag) => {
        const hasId = attrs.includes('id=')

        if (hasId) {
          // If already has ID, don't modify it
          return match
        } else {
          // Add ID attribute
          return `${openTag}${attrs} id="${item.id}">${text}${closeTag}`
        }
      },
    )
  })

  return contentHtml
}

interface BlogPostData {
  title: string
  author: string
  contentHtml: string
  toc: TableOfContentsItem[]
  premium: boolean
  excerpt?: string
  ogImage: string
  heroImage?: string
  description?: string
}

export async function getBlogPost(slug: string): Promise<BlogPostData | null> {
  const markdownFile = path.join(process.cwd(), 'src/app/blog', `${slug}.md`)

  if (!fs.existsSync(markdownFile)) {
    return null
  }

  const markdownWithMetadata = fs.readFileSync(markdownFile).toString()
  const { data, content } = matter(markdownWithMetadata)

  // Prioritize ogImage from front matter, then find first image
  const ogImage = data.ogImage ?? '/logo.png'

  // Read heroImage from front matter
  const heroImage = data.heroImage as string | undefined

  // Extract table of contents from the markdown content
  const toc = extractTableOfContents(content)

  // Get the first paragraph for excerpt
  const paragraphs = content.split(/\n\s*\n/)

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(transformDirectivesPlugin)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(addTargetBlankToLinks)
      .use(rehypeStringify)

    const file = await processor.process(content as string)
    let contentHtml = file.toString()

    // Add IDs to headings after HTML generation - wrapped in try-catch to handle any errors
    try {
      contentHtml = addIdsToHeadings(contentHtml, toc)
    } catch (e) {
      console.error('Error adding IDs to headings:', e)
      // Continue with the unmodified contentHtml
    }

    return {
      title: data.title ?? 'Untitled',
      author: data.author ?? 'Unknown',
      contentHtml,
      toc,
      premium: data.premium === true,
      excerpt: paragraphs[0],
      ogImage,
      heroImage,
      description: data.description as string | undefined,
    }
  } catch (error) {
    console.error(`Error processing markdown for ${slug}:`, error)
    return {
      title: data.title ?? 'Untitled',
      author: data.author ?? 'Unknown',
      contentHtml: '<p>Error processing content.</p>',
      toc: [],
      premium: data.premium === true,
      excerpt: paragraphs[0],
      ogImage,
      heroImage,
      description: data.description as string | undefined,
    }
  }
}
