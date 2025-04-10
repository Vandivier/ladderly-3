'use client'

import React, { useEffect, useRef } from 'react'

// Define TOC type based on what getBlogPost returns
export interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

// Update props to accept HTML string and TOC items
export interface BlogPostContentProps {
  contentHtml: string
  userId?: string
  toc?: TableOfContentsItem[]
}

const PREMIUM_SIGNUP_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK

// Simplified component to render pre-processed HTML
export function BlogPostContent({
  contentHtml,
  userId,
  toc = [],
}: BlogPostContentProps) {
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
    })

    // Add IDs to headings based on TOC
    if (toc.length > 0) {
      toc.forEach((item) => {
        const heading = contentRef.current!.querySelector(`#${item.id}`)
        if (heading) {
          heading.setAttribute('id', item.id)
        }
      })
    }

    // Rerun effect if userId changes or contentHtml changes
  }, [userId, contentHtml, toc])

  return (
    <>
      <div ref={contentRef} dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </>
  )
}
