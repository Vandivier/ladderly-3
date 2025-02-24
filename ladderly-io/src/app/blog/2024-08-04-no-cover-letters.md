---
title: '15. On Cover Letters and Resume Tailoring'
author: John Vandivier
---

This article makes a data-driven case that creating a cover letter and tailored resume for each job post is not an optimal use of time and effort for most software engineers during their job search.

The article combines scholarly research with original analysis to push back on an observed error in common wisdom on the subject.

This article makes the case with nuance, pointing out edge cases in which that standard advice may not hold.

## Common Wisdom

Common wisdom holds that tailoring your resume will lead to increased response rates. [This LinkedIn poll](https://www.linkedin.com/pulse/one-size-fits-all-vs-custom-fitted-resumes-which-get-you-anderson/) (n=938) from Chris Anderson in 2021 documented this popular advice. 56 percent of respondents affirmed that "one or two" tailored resumes would "get better results" than "a large number of generic resumes." Here are a few problems with this analysis:

1. "Better results" is ambiguous and mathematically falsifiable under some assumptions about what constitutes "a large number of generic resumes."
   1. Imagine that a tailored resume performs ten times as well as a generic resume. Then, the generic resume would get more callbacks and job offers with as few as eleven applications, ceteris paribus.
   2. While some job seekers might consider ten or twenty applications to be "a large number," this would not be the normal usage in statistical work, where large would imply at least one hundred.
2. The term "generic" has a stigma, which will repel poll votes for psychological and behavioral reasons independent of real resume performance.
   1. Social acceptability bias exacerbates this effect when polls are not anonymous, as in the case of a LinkedIn poll.
   2. Psycho-social biases are further exacerbated on LinkedIn due to echo chamber effects. Respondents tend to be members of the network of the poll creator rather than the general public, and social networks tend to share opinions and desire to affirm one another, so stigma response will be doubly problematic in LinkedIn polls.
3. This advice is not specific to software engineers or the technology industry, and application norms vary significantly by industry.

To get a slightly better read on this with respect to software engineers, [I ran my own poll](https://www.linkedin.com/posts/john-vandivier_which-approach-is-likely-to-generate-more-activity-7225517862566670336-IX3L/) with more precise wording, asking:

> Which approach is likely to generate more interviews for software engineers (and nearby roles like web developer, full stack developer, data engineer and so on)? Which application approach will likely generate more interviews? 100 apps tailored per role or 10 apps tailored per job post?

This poll is more useful for the Ladderly.io audience for four reasons:

1. It is specific to software engineering and similar roles.
2. The quantities are concrete, resulting in a debiasing effect and also more useful quantitative interpretation.
3. This poll avoids stigmatic language.
4. This poll is more recently, notably existing after the use of AI for tailoring has become common.

![LinkedIn Poll Results](/blog/images/cover-letters-poll.png)

This poll indicates that popular support for post-tailored resumes not only holds for software engineers, but the support is exaggerated compared to other industries with a strong majority expecting at least ten times higher performance from a tailored resume!

My poll notably replicates echo chamber effects. My belief based on my job search experience is that resume tailoring isn't important. 40% of poll participants that are first-degree LinkedIn connections agreed, selecting "100 apps tailored per role," while only 20% of other poll participants further from me in social graph distance selected that option.

In summary, common wisdom holds that tailoring is not merely beneficial, but it is a multiplier technique rather than an incremental improvement. The prediction from common wisdom is that time spent on tailoring has a better return on investment compared to allocating that same time toward a second application. The main problem with this belief is that there is concrete data to suggest other practices provide better return.

A notable secondary issue is that the practice of tailoring a resume varies widely. [Here](https://career.arizona.edu/resources/tailoring-your-resume/) is a five-step method from the University of Arizona. All five steps are partially addressed by tailoring a resume to a job family or role rather than a particular job post.

## Ladderly's Guidance

A different school of common wisdom holds that a personal discussion will often reveal more about a person than their resume. This is closer to Ladderly.io's guidance, which is that social networking and brand building are far better allocations of time compared to fine-tuning the resume or writing a cover letter.

There is a technical implication of this model which is that social networking attenuates the effects of the resume and the cover letter. Indeed, original data later in this article will show that social networking effects dominate the job search, so the resume and cover letter are not only attenuated but also small to negligible after social networking is accounted for.

Instead of sending a cover letter to a hiring manager, connect with them on LinkedIn. There are two additional benefits to this approach:

1. Reaching out on LinkedIn can generate a referral, while a cover letter does not. Referrals are powerful.
2. Your social network grows independent of whether you achieve an interview.

## Existing Research

Consensus.app is a tool that aggregates scholarly literature to find papers relevant to a particular research question. On the question ["Does resume customization improve job search outcomes?"](https://consensus.app/results/?q=Does%20resume%20customization%20improve%20job%20search%20outcomes%3F&synthesize=on) the tool finds nine related papers but there is not enough data to provide a consensus answer because several metrics are identified, but it is not clear whether they constitute an improvement. My review indicates two highlights:

1. Providing job seekers with resume and cover letter templates as well as tips on how to look and apply for jobs "increased job-finding rates, particularly among job seekers aged 35-50 (up to 8 percentage points)"
   1. From Guglielmo Briscese et al. "Improving Job Search Skills: A Field Experiment on Online Employment Assistance." Political Methods: Experiments & Experimental Design eJournal (2020). <https://doi.org/10.2139/ssrn.3584933>.
2. Resume characteristics such as experience and education, positively impact the likelihood of receiving an interview invitation from an organization.
   1. This was the only paper that assessed factors of interview attainment. Tailoring was not supported.
   2. From Peg Thoms et al. "Resume Characteristics as Predictors of an Invitation to Interview." Journal of Business and Psychology, 13 (1999): 339-356. <https://doi.org/10.1023/A:1022974232557>.

From these papers I think we can conservatively and generously award an upper-bound of a 10 percent increase in interview attainment or job finding to the cover letter and tailored resume.

## An Original Contribution of Data

[John Vandivier](https://vandivier.github.io/not-johns-linktree/) is the founder and lead maintainer of Ladderly.io and in 2024 he conducted a job search from May through early August. He censored and open sourced his job search data and it provides useful insight into the topic of the current article.

Specifically, his data showed no significant correlation between different resume versions and the attainment of an interview. The table below describes an ordinary least squares regression of interview attainment:

| Dep. Variable:      | attained_interview |
| ------------------- | ------------------ |
| Model:              | OLS                |
| No. Observations:   | 133                |
| R-squared:          | 0.352              |
| Adj. R-squared:     | 0.326              |
| F-statistic:        | 13.79              |
| Prob (F-statistic): | 9.41e-11           |

|                     | coef    | std err | t      | p(t)  |
| ------------------- | ------- | ------- | ------ | ----- |
| const               | 0.1068  | 0.103   | 1.034  | 0.303 |
| is_low_effort       | -0.0972 | 0.164   | -0.594 | 0.554 |
| Resume Version      | 0.0054  | 0.036   | 0.149  | 0.882 |
| Company             | -0.0003 | 0.001   | -0.323 | 0.747 |
| Referral            | 0.2361  | 0.078   | 3.030  | 0.003 |
| Inbound Opportunity | 0.6636  | 0.091   | 7.294  | 0.000 |

Referral and inbound opportinities were essentially all that mattered. Social networking, brand building, and LinkedIn optimization drove these variables. In addition, a low effort application is partly described as an application in which no social networking occured.

This particular job search took place during a particularly difficult market for candidates, or a favorable market from the employer point of view. Magnitudes are expected to shift over time and in association with software engineer labor market conditions. In particular, the constant is likely to increase in a market that favors candidates more strongly.

The data can be found [here](https://github.com/Vandivier/ladderly-3/blob/main/blitz-app/scripts/analytical/blog-15-job-search-regression.csv) and the analytical script used for the above regression table can be found [here](https://github.com/Vandivier/ladderly-3/blob/main/blitz-app/scripts/analytical/blog-15-job-search-regression.py).

A caveat in this result is that even the earliest version of the resume could be describe as fair in quality, without obvious grammatical errors, major ATS parsing issues, or other major issues. So the fact that the variation in resume version did not correlate with outcomes does not mean that resume quality has no impact, but it does mean that once you have a fairly high quality resume, fine-tuning it into an ultra-high quality resume has negligible return, which is exactly applicable to the discussion of whether a resume should be optimized per job post or simply at the level of the job family or role.

Notably, although the effect was insignificant, it was also positive and small, which is consistent with the idea that a larger study with many rows of data may indeed find some small positive effect. It is also consistent with the idea that fine tuning the resume for each job post is not an optimal use of time and effort.

## Edge Cases

When you have a singular target role or company, fine-tuning your resume to that role or company makes sense. While social networking will have a greater impact, you can do both. In generally, Ladderly.io recommends against targeting a specific company for most people. Such a strategy increases timeline for the job search and generally reduces potential compensation by eliminating the ability to obtain competing offers.

Still, there is an exceptional case where tailoring does make sense. This is the case when a job candidate intends to fully exhaust the market of potential employers. If a candidate has a timeline which can support applying to every employer of interest with additional time remaining, it makes sense to invest such additional time into improving the odds of success for that given pool of employers.

Here are a few such cases which might motivate an individual without respect to timeline, compensation, or risk:

1. An individuals is interested in an ultra-niche technologies, skills, activities, or causes.
2. An individual is already paid top-of-market, so only a few companies could potentially support an increase in desired compensation.
3. An individual is restricted for geopolitical or other reasons to work with a small market of potential employers.
4. An individual is attracted to a particular brand or working with specific people that occupy specific companies.

Earlier in this article, I gave the advice: "Instead of sending a cover letter to a hiring manager, try to get them on a call." Two objections to this advice come to mind:

1. What if the hiring manager and other networking targets at the company of interest cannot be identified or are unresponsive?
2. What if you already had a call with them? Why not do both?

Ladderly.io's general advice would be to spend your time and effort at another company with more transparency and responsiveness, but that general advice isn't useful in the edge cases reviewed here where there are no other viable employment options for the candidate.
