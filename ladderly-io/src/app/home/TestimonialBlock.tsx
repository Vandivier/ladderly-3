export type Testimonial = {
  testimonialGiverName: string;
  testimonialLinkedInUrl: string;
  testimonialText: string;
};

export const defaultTestimonial: Testimonial = {
  testimonialGiverName: "Calvin He",
  testimonialLinkedInUrl: "https://www.linkedin.com/in/calvin-h-he/",
  testimonialText: `Ladderly.io's advice and Leetcode Kata helped me fill in the gaps from my web development boot camp. Without John's generous resume review and career advice, I wouldn't have landed my remote job this year!`,
};

export const testimonials: Testimonial[] = [
  defaultTestimonial,
  {
    testimonialGiverName: "Chris Flannery",
    testimonialLinkedInUrl: "https://www.linkedin.com/in/chriswillsflannery/",
    testimonialText: `The Ladderly Leetcode Kata is awesome. After using it for about two months, I'm notably more efficient and confident in coding interviews.`,
  },
  {
    testimonialGiverName: "Isaiah LaDuke",
    testimonialLinkedInUrl: "https://www.linkedin.com/in/isaiah-laduke/",
    testimonialText: `It can't be overstated that Ladderly was crucial to my career. From coding, to interviews, to resume advice, to simple encouragement, I received more help than I thought I would be able to gain.`,
  },
  {
    testimonialGiverName: "Pratik Thorat",
    testimonialLinkedInUrl: "https://www.linkedin.com/in/pratikwebworks/",
    testimonialText: `I just got off of an interview that I obtained thanks to Ladderly's Networking Scripts. My resume was passed down to the hiring manager. I owe everything to John and Ladderly.io's open-source curriculum!`,
  },
  {
    testimonialGiverName: "Jonathan Norstrom",
    testimonialLinkedInUrl: "https://www.linkedin.com/in/norstromjonathan/",
    testimonialText: `I was laid off and my confidence took a hit. Interviewing was hard in ways that I'd forgotten about. Thankfully, John Vandivier stepped in as a mentor, ran a mock interview, and we created a plan to improve my weak areas. He was kind and knowledgeable. I signed offer within two months.`,
  },
];

export const TestimonialBlock = () => {
  const randomTestimonial =
    testimonials[Math.floor(Math.random() * testimonials.length)] ??
    defaultTestimonial;

  return (
    <div>
      <p className="mb-4">{`"${randomTestimonial.testimonialText}"`}</p>
      <p className="font-bold">{randomTestimonial.testimonialGiverName}</p>
      {randomTestimonial.testimonialLinkedInUrl ? (
        <a
          href={randomTestimonial.testimonialLinkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Connect on LinkedIn
        </a>
      ) : null}
    </div>
  );
};
