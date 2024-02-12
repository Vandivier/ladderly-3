---
title: "8. Essentials of HTML"
date: 2/11/24
author: John Vandivier
---

This article describes HTML, when it should be learned, when time spent on it should be reduced, and an exercise to improve portfolio personalization using HTML and design thinking.

## What is HTML?

HTML is an abbreviation for hyper text markup language. We call it hyper text because it includes text, media content such as images, interactive elements, and website metadata meant for robots and search engines to read rather than for humans. Examples of interactive elements include links, checkboxes, buttons, and video players.

HTML alone can be used to create a very basic website that can present pictures and information to an end user, but it can't do much else by itself. For example, a user cannot easily toggle between light mode and dark mode color themes with HTML alone. You will need CSS and JavaScript for that.

CSS allows website developers to customize the shapes, sizes, and colors of text and other elements on the website. JavaScript allows the website to dynamically change in response to user interactions. Together, when a user clicks a button to toggle the color theme, JavaScript can tell the elements on the screen to switch CSS rules from light to dark, changing their colors in real time.

A final important point about HTML is that it allows programmers to connect these technologies. CSS and JavaScript work together in the context of an HTML page. In fact, you can technically write HTML, CSS, and JavaScript all in a single HTML file!

## When Should I Learn HTML?

Web developers are expected to know, at a minimum, HTML, CSS, and JavaScript. Because HTML forms the connection point of these technologies, it makes sense to learn HTML first. Another reason to learn HTML first is that CSS is a modifier language. CSS works by operating on HTML elements, so it doesn't make sense to learn CSS before HTML.

Web developers sometimes make the mistake of trying to learn a modern framework like React before learning the fundamental underlying technologies of HTML CSS, and JavaScript. In this case the student goes back to study HTML after they have started learning React. They start learning HTML at the wrong time by starting it late.

An even more common, if less discussed, mistake is for developers to spend too much time learning HTML before continuing on to more important subjects. It is not optimal in terms of return on investment to time and effort to attempt to master HTML before continuing to CSS and JavaScript. The [official HTML specification](https://html.spec.whatwg.org/) is constantly changing and contains over 760,000 words of content.

The [Ladderly Standard Checklist](https://www.ladderly.io/checklists/my-basic-checklist) recommends starting to program by learning search techniques. The checklist then walks students through a high-level overview of HTML, CSS, and JavaScript in about an hour in an exercise called the Trial by Fire. Diving deeper into HTML is recommended after doing that initial overview.

This video describes the [9 essential topics in HTML](https://youtube.com/watch?v=YTTp7I7mLVI) that Ladderly recommends for students to learn before proceeding to CSS. The video is about 30 minutes long. Most students should be able to learn the essentials of HTML in under two weeks.

## A Useful Exercise

After completing the Trial by Fire, you will have a standardized project on your GitHub. Let's personalize it! Personlize the Vanilla Blog you created in the Trial by Fire with three easy steps:

1. Write two of your own blog articles, using the `article` tags with a heading and one or more paragraphs for each of these articles. Choose any topic that interests you. A few recommended topics might include:
   1. Technical things you have learned so far.
   2. An autobiography of your background prior to learning to code, and what motivated you to want to learn.
   3. Some sort of hobby you are passionate about. Cooking, music, athletics, or so on.
2. Pick out your favorite color. Use the [Paletton](https://paletton.com/#uid=1000u0kllllaFw0g0qFqFg0w0aF) theme picker or a similar tool to expand this color into a color theme.
3. Apply this theme to your page by changing the color of the page background, the text color, and also try to create a card design for your blog articles to draw user attention to the blog articles and create an automatic recognition of distinct articles.
   1. Your card design might include rounded corners, a background color distinct from the page backgrdound, a border, and horizontal or vertical margin or padding.
   2. An example card with inline style is given below:

```html
<article
  style="border: 1px solid lightgrey; border-radius: 10px; background-color: #f9f9f9; padding: 1rem; margin: 0.5rem auto; max-width: 300px;"
>
  <h2>My Article</h2>
  <p>My text</p>
</article>
```

That's it! Now your standardized project has been personalized, which will help make your portfolio stand out. Hopefully you learned a thing or two in the process!
