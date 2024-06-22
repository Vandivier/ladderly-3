import React, { useEffect, useState } from 'react';
import './TableOfContents.css'; // Import the CSS file

const TableOfContents = () => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    // Function to add IDs to headings if they don't already have one
    const addIdsToHeadings = () => {
      const elements = document.querySelectorAll('h2, h3, h4');
      elements.forEach((element, index) => {
        if (!element.id) {
          element.id = `heading-${index}`;
        }
      });
    };

    // Function to extract headings
    const extractHeadings = () => {
      const elements = document.querySelectorAll('h2, h3, h4');
      const headingsArray = Array.from(elements).map((element) => ({
        id: element.id,
        text: element.innerText,
        level: element.tagName.toLowerCase(),
      }));
      setHeadings(headingsArray);
    };

    addIdsToHeadings();
    extractHeadings();
  }, []);

  return (
    <nav className="toc">
      <ul>
        {headings.map((heading, index) => (
          <li key={index} className={`toc-${heading.level}`}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
