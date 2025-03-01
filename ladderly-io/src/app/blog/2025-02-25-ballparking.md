---
title: '22. Ballparking Project Impact'
author: John Vandivier
premium: true
---

Ballparking is estimation with low rigor. When we talk about ballparking a metric, particularly for project impact estimation, we mean estimation without confidence intervals, tests of causality, and other elements of rigorous formal statistics. This article will explain when, why, and how to use ballparking metrics for job search and design purposes.

## When is Ballparking Useful?

Ballparking is useful:

1. When empirical data is relevant to a decision.
2. When precise and relevant data is absent, costly to obtain, or inefficient for the purpose of communication.

This article will focus on two specific cases, but there are many more:

1. Project Evaluation for the Job Search
2. Project Evaluation in Solution Design

In the analytical lifecycle, ballparked metrics are useful in at least two key locations:

1. At the outset, when raw data is observed. Analysis is costly and sometimes working with raw data is efficient from a process perspective.
2. After final analysis is done, when communicating a complex story subject to constraints around time and complexity. Similar to the process of rounding decimal numbers, we prune complexity and precision to make communication easier, efficient, or right-sized to the conversation at hand.

A little more in defense of working with raw data: Notice that all measures are primitively observed or created in a state of low rigor. At every stage of analysis, we can optionally choose to apply marginally more analytical rigor. We should only make that investment if the marginal benefit is worth the marginal cost.

It turns out that the normal level of rigor in the software engineering industry is lower than the standard level in academic research, which is intuitive for many reasons including the fact that researchers are specialists.

You might worry, then, that this pattern breaks for scientific work, and it does but not much. Researchers do have slightly longer resumes on average. If you are interested in applying for SWE and DS roles you can simply maintain two resumes, and you may highlight different metrics within each resume. You can ballpark figures on both of them.

## When is Ballparking Not Useful?

When you can easily access precise and relevant data, that same data is easy to interpret and communicate, and it is already trusted or subject to low risk of measurement error.

Ballparking may also be of little value in cases where all parties have high and overlapping context, so that nuanced data can be shared and mutually understood.

## General Tips

Whether you are using ballparked metrics for design or the job search, three general tips apply. You should communicate your metric with:

1. Parsimony - Ballparking is value in part due to simplicity. By hiding a simple fact in a verbose container, we undermine total value.
2. Plausibility - Ballparked metrics are low rigor, so they tend to trigger rational questions around plausability. Read on for techniques to check for plausibility.
3. Purpose - We use metrics to drive towards some larger goal. When you check for parsimony and plausibility, don't merely check that the value of the metric is plausible, but also that it's relation to your overall goal is plausible. If your audience deems the metric irrelvant to your overall goal, it's not useful.

### Checking for Plausibility

Whenever we tell a story, it's important to consider the audience. With this skill of empathy active, we can consider our story from their perspective and ask "Does this seem plausible?"

A story is plausible if there is a reasonable chance it is true. Merely filtering irrelevant details doesn't make a story implausible. To test whether a metric is a fiction, one thing we can do is simply ask, "How did you come up with this number?" So, as the storyteller, we should generally be prepared to describe the way a metric was derived.

A truth can also be implausible if it is simply extremely unusual. So, as a storyteller, I might actually want to tone down my achievements in some cases to avoid triggering this kind of suspicion. In many cases we can modify our presentation in a way that is conservative or modest to this end. If I delivered a multi-million dollar project with three days of effort, this might appear unbelievable, or it might appear as an implausible data point for the use of forecasting a design delivery schedule. Instead I can say that I delivered such a project within half a quarter, in less than a month, and so on.

Two other techniques to raise plausibility:

1. Use multiple metrics. I recommend 2-3 because more than that begins to generate too much complexity in most conversations.
2. Consider changing the level or format of the metric. Absolute numbers, percentages, and annualized figures may be more or less imprecisive and understanable to the listener. Again, much of this pain is just solve by presenting more than one metric.

As a storyteller, it's a smart idea to A/B test the way you tell the story to find a version that is both easy to tell and resonates with most audiences. In the design world we sometimes call this workshopping, and you can leverage an Onion Strategy to ensure a final and public design is high quality.

### The Onion Strategy

The Onion Strategy is the simple collaboration strategy that is useful to ensure high quality of broadly communicated material.

Start off by presenting a draft of a design, article, speech, or other material to a small and trusted group, even just a single person. Get their feedback and ensure their support then move on to an incrementally larger group that includes the already-aligned subgroup. After a few iterations you can move forward with public communication expecting a high level of quality and alignment.

## Ballparking in the Job Search

In the case of a resume or an interview, you have little time to communicate results:

1. A recruiter looks at your resume for [six to seven seconds](https://www.indeed.com/career-advice/resumes-cover-letters/how-long-do-employers-look-at-resumes).
2. Resume best practice includes sticking to a single page for most applicants and keeping achievement statements to a single sentence within each experience block.
3. [Best practices for behavioral and conversational interviews](blog/2025-02-24-behavioral-interviews) include being able to describe a story in under 3 minutes.

These constraints make it valuable to present impact in a way that's easily consumed and understood by a wide business audience. The most broadly understood metrics include profit and its components:

1. Revenue or net revenue
2. Cost
3. Profit or net income

Here are some examples of metrics with less obvious business value:

1. Error frequency
2. Element engagement rate
3. Latency changes
4. Test coverage

One way to use ballparking is to convert a metric into another metric which is more consumable. You can to this by using basic math to change the unit of measurement, eg:

1. I reduced latency by 50%
2. Latency causes end user dissatisfaction
3. End user disatisfaction causes churn
4. Churn reduces revenue
5. Latency reduction is also associated with increased infrastructure cost

So, we can plug in estimates for each multiplier and come up with a ballparked estimate of the total impact. Notice that rounding at any or every step is fine and multipliers may conflate correlation with causation. If you can make an appropriate correction, do so, otherwise you can just explain that you're assuming a linear relationship for the purpose of estimation if you are asked about how the value was calculated.

Data that you observed at the company is best, but if this data is not available then we can use industry data or academic estimates. For example, [a 2020 report by SaaS Analytics estimates the relationship between customer satisfaction and churn](https://akitaapp.com/blog/the-correlation-between-customer-satisfaction-and-retention). I found this with a simple search on Google for `correlation between customer satisfaction and churn`. You might also consider using performing an AI search or utilizing [other standard search techniques](https://www.youtube.com/live/J2-BF64-sGQ).

---

Ballparking can give confidence to designs and behavioral stories by providing robust project evaluation. Robust evaluation refers to a project evaluation using a basket of statistics instead of a single metric. Very often, optimizing on a single metric becomes a pitfall resulting in design overfitting, but if a project provides positive signals across a range of relatively independent metrics, the project is in some sense less risky and can lead to higher confidence.

Even if a collection of metrics are highly correlated or endogenous, rather than independent, using multiple metrics can improve project communication because stakeholders may be familiar with certain metrics. In fact, you may want some redundant metrics as this provides robustness against measurement error and improves observability.

Ballparked figures are typical for use in the behavioral interview, the resume, the job search, and ordinary conversation. When you make a claim around your project impact in a non-scientific context, there are four important norms to consider:

1. Your claim should be plausible.
2. Your claim should be relevant.
3. Your claim should not be scientific.

four main norms apply in non-scientific contexts:

1. There is no expectation of scientific rigor. You don't need to perform a causal analysis. You don't need to prove signifant difference from a counterfactual. It's fine to round numbers.
2. There is an expectation of reasonability

3. It should be relevant.

Ballparked figures are subject to interrogation, but the method

The resume and behavioral interviews both draw on a list of accomplishments on the part of the job candidate. The candidate is ideally able to tell a cohesive story using these accomplishments which signals to the employer that the candidate meets or exceeds the criteria the employer hopes to hire. An important component of the storytelling is the use of quantified impact metrics.

This article will focus on solving a common pitfall which is a lack of quantified impact. See `21. Advanced Behavioral Interview Prep` for a discussion focused on the storytelling component. Indeed, from a language model perspective, much of a good resume is a distillation of the behavioral interview, so understanding the behavioral interview is key to writing a good resume.

A common pitfall in the job search is the lack of quantified impact in the resume, which is often an indication of weak behavioral interview material as well because the same achievements and metrics which perform well in the behavioral interview are typically noted on the resume.

Let's assume that you have a list of STOARR anecdotes.

## In the Job Search

Ballparking provides achievement metrics, and here are a few examples of when to use those metrics on the job search:

1. [During interviews including behavioral interviews](blog/2025-02-24-behavioral-interviews), hiring manager conversations, recruiter screens, and more.
2. In the resume, which is a distillation of the behavioral interview.
3. When social networking and creating social media content. See, for instance, [this suggested referral seeking script](/blog/2025-01-20-social-networking-scripts#main-cold-referral-seeking-script) which references a recent achievement.

### Case Study: Ballparking Renewed Contract Value

In 2016, I was working at SAIC on the Official Correspondence (OC) project, which was contracted by the U.S. Patent and Trademark Office (USPTO). The OC team was a scaled agile team of over 50 headcount tasked with modernizing Patent Examiner legal document creation. I had been working as a JavaScript Developer on the main web app and became aware of a priority pain point: Patent Examiners needed to author Custom Documents in Microsoft Word and no one in the team had experience with this. I took initiative to create a proof of concept using JavaScript to create an MS Word extension.

As a result of my proof of concept work, I was able to identify that the JavaScript API for Office was unable to support the complexity of the Custom Document requirements. I advocated for a full solution in Visual Basic and taught myself Visual Basic concurrently. With client support, SAIC leadership supported the decision to build Custom Document support in Visual Basic and I was made team lead of a team that grew to 13 headcount including 9 engineers and other staff.

In telling this story in interviews, I initially struggled to communicate the value of my work. While I had been told that the Custom Documents feature was make-or-break for the contract, the boolean fact of contract renewal was viewed as a weak estimate of impact by some and some interviewers were also skeptical of the claim that my work was the main driver of the contract renewal. After retrospectively ballparking impact, I found I was much more succesful with this story. Here's how I ballparked the final figure I claim today, an impact of at least $1 million for my contribution:

1. I was paid around $70,000 per year at the time, and I was paid less than average as an early career engineer.
2. For 50 contractors, this conservatively represents a cost center of about $3.5 million.
3. SAIC averages over 10% margin on their contracts.
4. From 1-4 we can conservatively estimate the contract value at $4 million. This is independently plausible given that the average value of a General Services Administration (GSA) contract was $2.9 million in 2016.
5. Let's assume the Custom Documents feature explains a minority of the contract value. We can estimate a 25% multiplier as the as the middle option between zero and 50%. This results in a ballparked value of $1 million.
6. This estimate is independently plausible given the headcount of the Custom Document feature team within the larger OC team.

## In Solution Design

There are at least three important roles for metrics when designing a solution:

1. Business justification to take on the work
2. Verifying delivery has been completed without error or concern
3. Measuring impact of the solution after delivery

The typical advice applies here: Use multiple measures to increase plausibility and reduce risk.

It's also worth calling out that there are some normal particular metrics to consider here.

For business justification:

1. Reduced cost
2. Increased revenue
3. Time saved
4. Stakeholder satisfaction
5. Reduced risk
6. Enablement of future work

For technical assurance:

1. Error rate
2. Latency - Generally more is better but the key is to understand the range acceptable to the stakeholders in the case of the current solution, and then to instrument monitoring to verify that the solution is meeting the requirements.
3. Cost
4. Usage
5. Uptime
6. Level of effort
7. Test coverage, type coverage, and logging

It's important to ensure that the technical and business metrics are aligned. Mini
