---
title: '36. Awesome Design Docs: How and Why to Make Them'
author: John Vandivier
---

A high-quality software design makes failure impossible and stakeholders happy. This article details how to craft a design document with several crucial elements, allowing it to mitigate risk, maximize value, and operate as a scientific tool, so that the only possible outcomes are success by hypothesis validation and success by learning through hypothesis invalidation.

## Four Modes of True Failure

The first mode of true failure is failing to research and design properly or at all. Product research and design should ultimately specify:

1. A product or service with certain features
2. To be sold to certain kinds of consumers
3. At a certain time and for a certain cost

These details form a minimal business case. Much more detail can be added, but not much more detail can be removed. Importantly:

1. Empirical values for these line items exist. This is not a matter of intuition or gut feeling. Conviction is a second-order concern.
2. Collecting these values is a research task which takes some amount of intentional time and effort.

Optimal resource allocation means allocating such that the marginal benefit equals the marginal cost. Zero upfront design time does not achieve this condition. Do not push back "This is Waterfall! We are Agile!" Agile does not mean zero planning, and if it did then the proper business optimization would be to ditch Agile rather than to ditch planning.

The second mode of true failure is failing to measure outcomes, or measuring outcomes that do not allow you to validate or invalidate some market hypothesis.

Remember that the product is a collection of features that we intend to sell to certain kinds of consumers. This plan or intent is equivalent to one or more hypotheses that we will be able to provide features on a certain timeline and cost profile then sell them to people. This means we need to measure:

1. The cost of our system, to ensure our sales can accomodate cost
2. The performance of our system, to ensure we are delivering the features at the planned level of quality
3. Target consumer and user behavior, to validate or invalidate our hypotheses around feature demand

With the wrong measures in place, we will not be able to improve because we will not know where the gap is between our hypothesis and reality. Is the system we intend to sell even running? Is there a lack of demand for a certain feature set or is there a login problem causing user access issues despite strong market demand?

Observability makes troubleshooting easier, but it does more than that. Analytics and telemetry solve business issues. Similarly, design docs make engineering easier, but they do more than that. They align engineers and nontechnical stakeholders.

The third form of true failure is ignorance of data or misinterpretation of data. If you run an experiment and never write it down, someone may come up with a similar idea in the future and be totally ignorant of the fact that this was already tried. Talk about wasted business resources. Alternatively, some folks may read the data and misunderstand it or outright disregard it. Guard against misunderstanding by circulating your design with the team. Group-level misunderstanding is less risky than individual-level misunderstanding, and even if the group is wrong at least you will have mitigated your own liability.

Disregarding old data is sometimes justified. Data changes over time and there may be doubts about the integrity of prior data. Make sure this risk is acknowledged and accepted by the team, being included in the overall calculation of risk and reward to the work under design. Unjustified disregard of data is a red flag, but intentionally disregarding it is simply a gamble, one that could potentially be justified.

The fourth and final form of true failure is spending too much time on things. While some design is usually a good idea, too much is a pitfall. Make use of timeboxing to iteratively allocate more time to design and ask whether the risk-adjusted value of the project is maximized by further design or by moving into execution and implementation. In addition to timeboxing, [here are some other time management techniques](https://www.ladderly.io/blog/2025-04-18-time-management#time-management-tips-for-agile-business-process).

## Intake Process and When to Make a Design Doc

Distinguish work requests between crisis work and ordinary work. This article will not cover crisis management. Every ordinary work request should go through a planning and intake process. Planning involves describing the work to be done and the priority of the work. The decision to create a design doc can be triggered by complex work requests.

During work intake, you don't need to evaluate the work if you can [simply deflect it](https://www.ladderly.io/blog/2025-04-18-time-management#make-time-by-saying-no). Check for the possibility of self-serve or routing the work to another better-fit team. In cases where your team is the proper owner, identify whether the work is clear or ambiguous. If it is ambiguous, you should perform a [spike](https://www.wrike.com/agile-guide/faq/what-is-a-spike-story-in-agile/), allocating a timebox to research. The result of this research should either be:

1. A solution, if trivial solution was found and executed within the timebox, or
2. A report, such as a design doc

## How to Use Your Design Doc

The design doc should list possible designs and go one step further to propose a particular design. The design doc contributors should identify selection criteria they used for which the preferred design becomes the best choice. This proposal can then be discussed with stakeholders and revised as needed until a final version has general approval. Once there is a design with general approval, the engineering team can proceed to enter tasks as designed into project management software.

## Essential Sections a Quality Design Doc

A design doc should include:

1. Background: This section explains the origin of the request, related stakeholders, prior work, assumptions, and a list of related resources. Assumptions will include the business hypothesis about how the requested work will generate business value.
2. SMART Metrics: Specific measures that can be used to confirm or deny the business hypothesis, measuring impact, and assisting in verification.
3. Design options: The list of options that design doc contributors investigated.
4. Preferred option: The implementation preferred by the design doc contributors with business justification and implementation details, ready to be transferred to project management software. These tasks enable timeline estimation.
5. Risks and mitigations: Given the preferred option, let's anticipate possible failure modes, plan for observability, instrumentation, and detection of problem cases, and pre-plan next steps, remediation, or pivot strategy.

## Tangential Topics

Design docs are conversational tools. Loads of soft skills come into play when attempting to achieve approval for a design, negotiate scope, and ultimately deliver a solution that satisfies stakeholders:

1. Leadership
2. Persuasion: [14 Years of Persuasion Advice in 35 Minutes](https://www.youtube.com/watch?v=JDR-R--4HhM) by Alex Hormozi
3. Influence
4. Communication
   1. [Foundations of Professional Verbal Communication](https://www.ladderly.io/blog/2025-04-19-professional-communication)
   2. [Communication deep dive with Vinh Giang](https://www.youtube.com/watch?v=oIiv_335yus)
5. Search Skills: [Seven Core Search Techniques](https://www.ladderly.io/blog/2025-03-30-debugging-tips#seven-core-search-techniques)
