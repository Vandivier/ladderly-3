---
title: '24. Debugging Tips'
author: John Vandivier
---

wip
<https://claude.ai/chat/2e9619c6-bd46-492e-b22e-51142aab804e>
<https://chatgpt.com/c/67e9938d-9908-800d-b5b2-7c60413bc75b>
<https://www.youtube.com/live/oHQiJ3kq52M>
<https://www.youtube.com/live/J2-BF64-sGQ>
<https://www.youtube.com/watch?v=htbGiafiILg>
<https://www.youtube.com/shorts/Dz2GwRVVIFE>
<https://www.tiktok.com/@johnvandivier/video/7486247403717201198>
<https://github.com/Vandivier/ladderly-3/issues/441>
<https://github.com/Vandivier/ladderly-3/issues/429>

There are loads of ways for software engineers to debug.

This article describes four groups of tips and gives special notes focusing on commercial patterns
and debugging in the interview.

These debugging tips overlap with remediation, testing, and other practices.

## Seven Core Search Techniques

Search techniques are foundational skills upstream of all technical and soft skill acquisition.

In this section, we quickly review a prioritized list of search techniques to enable immediate action. Later techniques will dive deeper.
You can also refer to [this video](https://www.youtube.com/live/J2-BF64-sGQ) for over an hour of content on this topic, diving deeper into each of the seven techniques with timestamps in the video description.

For commercial debugging in particular, be sure to read the `Commercial Patterns` section which also cuts across groups with a focus on industry norms.

Before I give you the seven search techniques, here are seven general usage tips in a debugging use case:

1. I recommend time boxing each solution attempt to five minutes. If you are making progress, continue on for another five minutes with the same technique. If you are not making progress, switch techniques.
2. Keep notes as you go. These notes can be a source of relevant context for AI tools and humans.
3. As you record notes, leverage analytical thinking skills to try and uncover a root cause. If you can confidently identify a root cause and solve it, you can eliminate worry that a code change may have simply hidden or moved the issue.
4. Besides technical facts, suspicions are also useful notes.
5. If you discover a critical piece of context, feel free to circle back to the top of the list.
6. Leverage version control with lots of small commits. If you observe an error change, it may not be immediately obvious whether you have solved the initial error and found a subsequent error, or perhaps a code change introduced a new error. Lots of small commits help you understand what happened and backtrack as needed.
7. Once you have solved an issue, consider implementing tests, types, or other automated checks to prevent similar issues from occuring in the future.

The seven core techniques are:

1. Generative Search, using an AI tool.
   1. This might include sending text or images to a tool like Cursor Composer or ChatGPT, with or without web search grounding.
   2. Ladderly.io also has an AI agent you can use which is pretrained on our own practices and opinions.
2. Reference code.
   1. If you have access to a code repository where someone implemented a similar solution, review their implementation. Maybe this is something you did in a prior repository!
   2. There may be a solution in a similar component or test in the codebase under issue. Try searching around the codebase to see whether similar code exists elsewhere without issue.
   3. If you don't have reference code on hand, good references can be found through the other search techniques.
3. Boolean and Keyword Search, also called Googling
   1. Make use of boolean operators and expressions such as exact match on an error message
   2. Trim down logs to the essential keywords and key phrases
4. Read the official documentation for the libraries and APIs you are using
5. Reading trusted third-party sources. This can include sources like Mozilla, highly voted Stack Overflow answers, and reputable blogs which often vary by domain, such as [CSS-Tricks](https://css-tricks.com/).
6. Guess and Check
   1. Try to locally reproduce the issue then use print statements, breakpoints, intuition, and intellisense to try out solving the issue
   2. Automated tests like unit tests are a great way to give you confidence that your solution works and does not introduce unexpected regressions. Other automated checks like type checking can also help.
   3. Tests not only catch issues, but they also act as documentation and debugging tools. Review tests that seem related to your issue and consider modifying them to give you insight into the root cause of the issues you are observing.
7. Social Escalation and Consultation. You can escalate to a coworker, a social network member, or post a question on a site like Stack Overflow.

## Bug Prevention

Prevention is the best medicine. Techniques to prevent bugs include:

1. Use types. This includes prefering a strong DB schema over a dynamic schema as an intelligent default.
2. Use automated tests
3. Include verification requirements alongside feature requirements. This is similar to the idea of test-driven development, though Ladderly.io doesn't require you write the test before the implementation code.
4. Prefer standard stacks, libraries, and conventions. This will give you more access to relevant documentation, reference code, AI tool performance, and support as you develop, whether or not you run into bugs.
5. Use code formatters, linters, and readable code.
6. Try to keep your local environment as similar to production as possible and use an isolated staging environment.
   1. This will allow you to reproduce production issues and fixes without mutating the production environment itself.
   2. The [Twelve-Factor App](https://12factor.net/) is a good mental model to reinforce this point
   3. Configuration as code and infrastructure as code are useful practices for this
7. Leverage database backups and consider whether your software solution can easily integrate database branching as a development workflow.
8. If possible, implement a high-quality peer review system.
   1. This article won't dive deep on this point, but even as a solo developer you can consider getting an AI code review tool

## AI-Driven Debugging Tips and Vibe Coding Remediation

Ladderly.io recommends AI-driven development and AI-driven debugging. The process outlined in this section will promote even higher performance for autonomous AI tools, humans with AI assistance, and it will expedite detection and remediation of issues sometimes produced by AI code generators.

1. Protect production from AI
   1. For generated code, it is the responsibility of a human to review and approve for production merge and deploy
   2. For generated SQL queries, it is the responsbility of the human to verify correctness before running on a production DB
   3. For generated shell commands and anything else: Always put a human between AI and production
2.

## Code-Based Debugging

Loggers + Breakpoints + Scripts (particularly for DB issues)

## Commercial Patterns

runbooks, commercial loggers, correlation IDs, health checks, commercial documentation practices / search strategies

when to spin up an incident (we don't dive deep into incident creation and handling, but it's important to be aware)

## Coding Interview Debugging
