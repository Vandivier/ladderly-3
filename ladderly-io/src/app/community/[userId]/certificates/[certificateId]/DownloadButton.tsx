'use client'

import { useState } from 'react'

interface DownloadButtonProps {
  certificateName: string
  userName: string
  certificateId: number
  issueDate: Date | string
  score: number
}

export default function DownloadButton({
  certificateName,
  userName,
  certificateId,
  issueDate,
  score,
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrint = () => {
    setIsLoading(true)

    try {
      // Create a style element to hide everything except our target
      const style = document.createElement('style')
      style.id = 'print-only-certificate-style'
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-region, #certificate-print-region * {
            visibility: visible;
          }
          #certificate-print-region {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
        }
      `
      document.head.appendChild(style)

      // Print the page
      window.print()

      // Clean up - remove the style element after printing
      document.head.removeChild(style)
    } catch (error) {
      console.error('Error printing certificate:', error)
      alert('Error printing certificate. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePrint}
      disabled={isLoading}
      className="inline-flex items-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
    >
      {isLoading ? 'Preparing...' : 'Print/Save as PDF'}
    </button>
  )
}
