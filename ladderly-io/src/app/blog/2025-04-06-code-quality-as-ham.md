---
title: 'Quality Software as a CUTE TYPE HAM'
author: John Vandivier
---

Ladderly.io is a platform for programming education, so it's fitting that we lay out some principles for code quality, system design, and the software development lifecycle (SDLC).

Ladderly.io's `CUTE TYPE HAM` mnemonic for quality software:

1. Includes some other well-known mnemonics
2. Specifically contrasts to some other approaches to clean code
3. Applies beyond the code to system design, process, and organizational concerns
4. Includes proper examples and antipattern examples to concretize the mnemonic

## The CUTE TYPE HAM Table

| Letter | Expansion | Brief Explanation |
|--------|-----------|-----------|
| **C** | **C**UPID | Follows [the CUPID principles for joyful coding](https://dannorth.net/cupid-for-joyful-coding/)  |
| **U** | **U**nderstandable | Intuitive and readable. Readability includes documentation. |
| **T** | **T**ested | Your code should be tested. This doesn't imply pure TDD. |
| **E** | **E**nvironment‑agnostic | Environmental parity, hermetic builds, and local autonomy |
| **T** | **T**yped | Types improve code quality. |
| **Y** | **Y**AGNI | Only build what you need now or near-term. |
| **P** | **P**ragmatic | Prioritize outcomes over principles. |
| **E** | **E**xplicit over implicit | Write out your low-level logic instead of using magic. |
| **H** | **H**uman‑centred | Emphasize DX and UX. Use BDD. |
| **A** | **A**utomated | Quality should be automatically implemented and verified. |
| **M** | **M**onitored | System behavior and issues should be highly visible. |

## The Letters in Depth

### C — CUPID

[Dan's CUPID principles](https://dannorth.net/cupid-for-joyful-coding/#properties-over-principles) are formulated as a response to [Bob's SOLID principles](https://www.freecodecamp.org/news/solid-principles-explained-in-plain-english/), but here at Ladderly.io we see strong compatibility between these approaches to software.

Ladderly.io encourages a pragmatic mental model focused on results over implementation details or hard technical rules. With this lens, CUPID and SOLID become totally harmonious. Dependency inversion becomes a useful tool to think about in our toolkit, rather than a hard requirement, and we don't split hairs between the single responsbility principle and a unix-like focus on doing one thing well.

The five CUPID properties are:

1. Composable: Constructed of discrete and reusable layers when possible
2. Unix philosophy: does one thing well
3. Predictable: does what you expect
4. Idiomatic: The solution prioritizes common and well-understood norms, standards, and conventions over innovations, novelties, and idiosyncrasies.
5. Domain-based: the solution domain models the problem domain in language and structure

The SOLID principles are:

1. Single Responsibility Principle
2. Open-Closed Principle
3. Liskov Substitution Principle
4. Interface Segregation Principle
5. Dependency Inversion Principle

Antipattern Examples:

1. Abusing the single responsibility principle by only allowing one export per file.
2. Requiring dependency inversion or an extension subsystem in your software.

Proper Examples:

1. Considering whether your system would benefit stakeholders by implementing an extension feature.
2. Considering whether dependency inversion improves the architecture of your system.
3. Organizing code, processes, and teams inline with domains of expertise
4. When two solutions are equally performant, avoid [shiny object syndrome](https://en.wikipedia.org/wiki/Shiny_object_syndrome) and select the option which is more well-known, documented, and popular.

Borrowed from [CUPID](https://principles.dev/), composability pushes us toward functions and modules that do *one* thing and chain together cleanly. It’s the antidote to “god objects” and tangled dependency graphs.

### U — Understandable

Understandable software means software that is:

1. Easy to reason about
2. Readable
3. Documented
4. Intuitive
5. Idiomatic

These goals are targeted across stakeholders, not simply in the mind of a single developer.

Antipattern Examples:

1. Excessively verbose or over-commented code, which actually ends up harder to comprehend
2. Importing an idiom inappropriately. Importing an idiom from another programming paradigm can actually make the current system harder to reason about.

Proper Examples:

1. Including a README.md with your solution that includes the standard boilerplate sections on how to setup, run, use, and modify the software.
2. Bootstrapping an application using a well-known framework according to the framework's official documentation.
3. Preferring linting and formatting rules that are frequently used over rules you may personally prefer, particularly in a team environment.

### T — Tested

Code that's tested is generally higher quality than untested code.

Further, tests improve team performance and tool performance by acting as documentation.

Finally, thinking through tests at requirement construction time leads to easier implementation, lower risk, higher delivery confidence, and improved stakeholder alignment.

Ladderly.io does not recommend pure TDD where a unit test must be constructed prior to writing the code under test, but instead recommends a modified TDD which states that test updates must be included with any feature change. This modified TDD ensures a high level of testing while preserving local developer environment freedom and autonomy.

Traditional TDD is still sometimes useful, particularly as a code review tool. By pushing a commit with a test update, seeing it break, and then fixing the code under test, a peer reviewer can be highly confident that a code change meets expectation. This is in contrast to a situation where the code under test is changed before the tests, so tests never failed, which could mask a falsely passing or missing test.

### E — Environment‑agnostic

Environment agnosticism highlights four values:

1. High-quality software makes use of multiple environments.
2. Environments have parity, so that issues observed in production can be confidently fixed without a production change. Ladderly.io encourages reviewing the [Twelve-Factor App](https://12factor.net/) approach to software design, which promotes environmental parity.
3. [Hermetic builds](https://medium.com/@tglawless/isolated-hermetic-and-reproducible-builds-dace1f46d793) are preferred. Hermetic builds promote issue reproduction and resolution in a way that compliments environment parity and automation, another engineering value that promotes system and team performance.
4. Local autonomy for developers. Forcing developers to configure their local machine a certain way is bad. Quality gates should be executed remotely instead of trusting local verification by developers.

Antipattern Examples:

1. Requiring or prohibiting the use of precommit hooks.
2. Trusting developers who say it worked on their machine as a reason to skip running CICD tests.
3. Logic gated behind environment flags, so that production works very differently to localhost.

Proper Examples:

1. Allow developers to develop with a local dev server if they want.
2. Enable developers to run a local container snapshot which reflects a production deployment if they want.
3. Automatically run lint, format, type, build, and test checks using GitHub Actions or another CICD solution.

### T — Typed

Types improve code quality, prevent issues, and improve the performance of AI tools.

### Y — YAGNI

When building a solution, prioritize getting the system shipped and making the system usable over making it future-proof.

### P — Pragmatic

Prefer shipping to polishing. Choose stable tools over shiny objects. Accept tech debt strategically and set your quality bar on the basis of evidence-based return on investment calculations. Optimize for business outcomes and stakeholder value over axiomatic technical principles. Use engineering principles, including the current `CUTE TYPE HAM` principles, as a useful mental checklist and toolkit over a set of hard requirements that must be accomodated at all times.

Antipattern Examples:

1. Require unit test coverage to exceed 80%.
2. All functions and variables must be fully typed.

Proper Examples:

1. If you can easily test some critical logic, do it.
2. Most code should probably be typed, since it's usually a good return on investment, but if there is a section of code that is hard to type and typing it is low value, it doesn't need to be typed. 100% type coverage on a incrementally typed or gradually typed codebase is inefficient.

### E — Explicit over implicit

Don't hide logic in a get or set function. Avoid magic which assumes developer knowledge when possible. Rails conventions do this to some extent and it can even create tooling and IDE compatibility issues. Writing out each step of logic, even when verbose, promotes debugging, onboarding, and tool performance.

### H — Human‑centered

Good software respects *all* its humans: maintainers, stakeholders, and end‑users. BDD scenarios capture stakeholder intent; clear error messages and accessible UIs respect consumers; tidy repos and helpful docs respect contributors.

Antipattern Examples:

1. Setting up comprehensive tooling for code quality without consulting your team on their preferences.
2. Implementing a high-quality machine learning model without consulting users about whether they will actually use it.

Proper Examples:

1. Empowering self-service by users when they want the capability.
2. Defining technical requirements on the basis of use cases which users have declared an interest in.
3. Implementing autofix tools and investing in developer experience, so we can maintain our high quality requirements without overworking our developers.

### A — Automated

*Machines do repetitive work better than humans.* Run formatters and linters pre‑commit, spin test suites in CI, deploy via pipelines, migrate schemas on release. A green pipeline is your licence to merge.

### M — Monitored  

If a tree falls in the prod forest and nobody gets an alert, did it crash? Instrument with structured logs, metrics, traces, alerts, and compliment issue identification with resolution tools like runbooks and documentation that includes keywords, titles, and references matched to the log messages and alert metadata in an useful way. Take advantage of dashboards

## Conclusion

`CUTE TYPE HAM` principles aren't a silver bullet; they are a compass. They point your team toward composable, understandable, environment‑agnostic, human‑friendly software that's a joy to build, maintain, modify, and use. Consider printing the table out and pinning it nearby!
