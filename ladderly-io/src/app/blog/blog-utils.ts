export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 238 // ref: https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300786
  const wordCount = content.trim().split(/\s+/).length
  return Math.round(wordCount / wordsPerMinute)
}
