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

// Helper function to properly escape ID selectors for querySelector
const escapeSelector = (id: string) => {
  // CSS selectors cannot start with a digit, a hyphen followed by a digit, or a hyphen followed by a hyphen
  // We need to escape these characters
  return id.replace(/^(\d)/, '\\3$1 ').replace(/([^\w\-])/g, '\\$1')
}

// Simplified component to render pre-processed HTML
export function BlogPostContent({
  contentHtml,
  userId,
  toc = [],
}: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null) // Ref to access the rendered content

  // Restore useEffect to handle client-side link modifications
  useEffect(() => {
    if (!contentRef.current) return // Exit early if ref is null

    // --- Premium Link Handling ---
    if (PREMIUM_SIGNUP_LINK) {
      const premiumLinks =
        contentRef.current.querySelectorAll<HTMLAnchorElement>(
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
    }

    // --- Scroll to Anchor ---
    if (window.location.hash) {
      try {
        const id = window.location.hash.substring(1) // Remove #
        const escapedId = escapeSelector(id)
        const element = contentRef.current.querySelector(`#${escapedId}`)
        if (element) {
          // Slight delay to ensure rendering is complete after potential ID assignments
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100) // 100ms delay, adjust if needed
        }
      } catch (error) {
        console.error(
          `Error scrolling to element with hash ${window.location.hash}:`,
          error,
        )
      }
    }

    // Add IDs to headings based on TOC
    if (toc.length > 0) {
      toc.forEach((item) => {
        try {
          // Use the escape helper to properly format the ID selector
          const escapedId = escapeSelector(item.id)
          const heading = contentRef.current!.querySelector(`#${escapedId}`)
          if (heading) {
            heading.setAttribute('id', item.id)
          }
        } catch (error) {
          console.error(`Error finding element with ID ${item.id}:`, error)
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
