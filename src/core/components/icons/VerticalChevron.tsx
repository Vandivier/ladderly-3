export const IconVerticalChevron = ({ isPointingUp = false }) => (
  <svg
    className={`ml-2 inline h-5 w-5 transition-transform duration-200 ${
      isPointingUp ? "" : "rotate-180"
    }`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
)
