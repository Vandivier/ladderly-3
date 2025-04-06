'use client'

import React, { useEffect, useRef } from 'react'
// Remove markdown/remark/directive imports
// import ReactMarkdown from 'react-markdown'
// import remarkGfm from 'remark-gfm'
// import remarkDirective from 'remark-directive'
// Keep Image if still needed for other parts, or remove if only used in markdown
// import Image from 'next/image'

// Update props to accept HTML string
interface BlogPostContentProps {
  contentHtml: string
  userId?: string // Keep userId if needed for other logic unrelated to markdown
}

const PREMIUM_SIGNUP_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK

// Remove handleAnchorDirective function
// function handleAnchorDirective(directive: any) { ... }

// Simplified component to render pre-processed HTML
export function BlogPostContent({ contentHtml, userId }: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null) // Ref to access the rendered content

  // Restore useEffect to handle client-side link modifications
  useEffect(() => {
    if (!contentRef.current || !PREMIUM_SIGNUP_LINK) return

    // Find all potential premium links within the rendered HTML
    const premiumLinks = contentRef.current.querySelectorAll<HTMLAnchorElement>(
      'a[data-premium-link="true"]',
    )

    premiumLinks.forEach((link) => {
      // Determine the correct target href based on userId
      const targetHref = userId
        ? `${PREMIUM_SIGNUP_LINK}${PREMIUM_SIGNUP_LINK.includes('?') ? '&' : '?'}client_reference_id=${userId}`
        : '/signup' // Fallback if no userId (user not logged in)

      // Update the link's href
      link.href = targetHref

      // Set target/rel appropriately
      if (userId) {
        // External Stripe link
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
      } else {
        // Internal /signup link
        link.removeAttribute('target')
        link.removeAttribute('rel')
      }

      // Optional: remove the data attribute after processing
      // link.removeAttribute('data-premium-link');
    })
    // Rerun effect if userId changes or contentHtml changes
  }, [userId, contentHtml])

  return (
    <div ref={contentRef} dangerouslySetInnerHTML={{ __html: contentHtml }} />
  )
}
