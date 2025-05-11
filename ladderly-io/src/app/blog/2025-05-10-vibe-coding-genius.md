---
title: '35. Code Smarter, Not Harder: Your Guide to Vibe Coding'
author: John Vandivier
---

Vibe coding, or AI-driven development, leverages the capabilities of AI tools to massively enhance productivity. Done properly, it can also be fun and stress-reducing!

This article provides a comprehensive guide to vibe coding, covering strategies for interacting with AI agents, optimizing your workflow, providing effective instructions, and incorporating insights from industry leaders.

## The Sandwich Model for Vibe Coding

When integrating AI into complex workflows, consider employing a "Sandwich Model." This approach involves starting with firm human-crafted guidance at the beginning of a task and concluding with hard gates or reviews at the end. This structure allows the AI to operate with flexibility and creativity in the middle portion of the process, leveraging its strengths while ensuring the final output aligns with human requirements and quality standards.

## The Three-Strikes Rule for AI Interaction

Interacting effectively with AI agents, especially when their output doesn't immediately match expectations, can be managed using a "three-strikes rule" strategy focused on thoughtful prompting and error handling:

- **Develop an Expectation:** Before you even prompt the AI, have a clear idea in mind of what the desired outcome should be.
- **Strike 1 (Yellow Flag):** If the AI's response differs from your expectation, treat this not as an immediate error, but as a "yellow flag" indicating a potential discrepancy.
- **Strike 2 (Inquire):** Instead of directly correcting the AI, inquire about its reasoning. Use a question-based prompt to understand the logic behind its response.
- **Strike 3 (Compare):** If disagreement persists after understanding its reasoning, present your original approach or desired outcome and ask the AI to compare and contrast it with its own response.
- **Potential Outcomes:** Through this process, the AI might change its mind, provide a valid alternative perspective you hadn't considered, or stand firm on its original response.
- **Final Action:** After going through this thoughtful process, if you still disagree with the AI's output and are confident in your approach, you have the option to override its output.

## Other Tips from Ladderly.io

Ladderly.io recommends AI-driven development, also called Vibe Coding, and AI-driven debugging. These tips promote high performance for AI workflows with many benefits to humans as well, covering development, debugging, issue detection, and remediation for both human-generated and AI-generated code.

1. **Protect production from AI:** Always ensure a human is in the loop before deploying AI-generated code, running SQL queries on production databases, or executing shell commands in a production environment.
2. **Use a competent AI tool:** Refer to resources like LMArena leaderboards (filtering by 'Coding') or HumanEval benchmarks to select models known for their performance in coding tasks. Be aware of the trade-offs between different models and tools (e.g., V0 for Next.js, Gemini for large context windows).
3. **Lovable Multiplayer:** For team workflows, consider practices that facilitate "lovable multiplayer" interactions, which can significantly boost overall team productivity when integrating AI.
4. **UI First:** When tackling full-stack changes with AI assistance, prioritize building the UI layer first, then the service layer, and finally the database schema. This sequence can help minimize disruptive database remigrations.
5. **Trivial vs. Non-Trivial Changes:** Discriminate between trivial and non-trivial changes. For non-trivial tasks, consider upfront planning like creating a design document or having a detailed discussion with a language model outside your IDE before coding.
6. **Provide high-quality instructions:** The effectiveness of AI tools hinges on the clarity and completeness of your prompts.
   - Leverage prompt engineering techniques like role prompting ("Act as an expert [technology] developer").
   - Include high-leverage components that provide context about your project: Role Definition, Codebase Conventions (naming, patterns), Dependency List (e.g., `package.json`), Folder Structure readout, Readme Content, Database Schema, and even an FAQ section for common issues.
   - Consider creating a script to automate the compilation of an instruction file from your project's source files (like dependencies, README) to ensure it's always up-to-date.
   - Include optional Human Query Material like runbooks to help the AI provide relevant assistance for error handling.
7. **Utilize tests, types, comments, and documentation:**
   - Tests provide context to the AI and catch issues early. Ask the AI to write tests and integrate CICD runners for automated checks.
   - Keep a runbook of common issues and resolutions – a valuable resource for both AI and human debugging.
   - Use readable and accurate names for variables, functions, and files to benefit both humans and AI.
   - Be tolerant of AI-generated comments and add your own for code that deviates from standards, as AI comprehends code syntax that resembles natural language well.
8. **Check your models with automated and manual verification:**
   - Utilize a staging environment for testing.
   - Perform manual smoke tests after deployments to catch issues automated checks might miss.
9. **Understand when to create a fresh chat thread:**
   - Model performance can degrade as the context window fills with irrelevant information.
   - Consider starting a new conversation for each new work ticket or when switching to a different area of the codebase.
   - Begin a fresh thread, possibly with a different model, if the current conversation shows persistent confusion or failure to follow instructions.

## Vibe Coding Tips from Y Combinator

Drawing inspiration from Y Combinator's insights on leveraging AI for development, here are four additional tips to enhance your vibe coding practices, as discussed in [this video](youtube.com/watch?v=BJjsfNO5JTo):

- **Experiment with voice input:** Utilizing voice input can potentially lead to faster interaction with AI tools.
- **Use screenshots in prompts:** Visual aids like screenshots can be highly effective in demonstrating UI bugs or conveying design inspiration to the LLM.
- **Use version control (Git) religiously:** Consistently using Git allows you to easily revert to previous working versions if an AI-assisted change introduces issues.
- **Copy and paste error messages directly into the LLM:** Providing the exact error message to the language model can significantly speed up the process of finding a solution.

This article, "Vibe Coding: Tips for AI-Driven Development," serves as article number 35 in the series. The previous article on Debugging Tips (number 24) will be updated to reference this article for vibe coding information.

## General Software Quality

This article previously gave tips on vibe coding. Ladderly.io has further discussion on general software quality. These general techniques can further bolster your software quality, although they are not specific to vibe coding:

1. [24. Debugging Tips](/blog/2025-03-30-debugging-tips)
2. [26. Build Quality Software: The CUTE TYPE HAM Way](/blog/2025-04-06-code-quality-as-ham)
