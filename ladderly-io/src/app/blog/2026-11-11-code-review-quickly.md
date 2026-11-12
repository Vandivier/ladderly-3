---
title: '39. Nine Ways to Get Code Reviewed Quickly'
author: John Vandivier
---

_Originally published at [Current Tech](https://currenttech.substack.com/p/9-ways-to-get-code-reviewed-quickly)._

![9 Ways to Get Code Reviewed Quickly](https://substack-post-media.s3.amazonaws.com/public/images/35cbabe5-3e10-4e35-81ca-0e6180e07495_3016x1612.png)

This article covers nine techniques that will help reduce cycle time, the time between a pull request (PR) or code change is marked ready for review and the time at which it merges.

Many of these techniques can be lightly adapted to any kind of draft-review workflow for non-code deliverables such as documents and presentations.

## 1: Conceptual simplicity

Sure, shrinking the PR by line count can help\*, but more importantly make a pull request simple and intuitive.

> \*Hot take: You shouldn’t minimize your PR size. There will be some bliss point that works best for you and your team. In some cases, an intentionally large PR is better for team throughput than many small PRs. See `Batched Code Review`. You can also consider stacked PRs which sometimes grant review and velocity benefits, but other times they can create extraneous team overhead and net penalize delivery speed.

There are other ways to make a PR very simple and intuitive even if it is large. A key technique: Let the PR do one thing. This is the same mental model as the single responsibility principle in SOLID architecture.

Example: a tests-only PR.

You can relax a hard “one thing” requirement but the principle remains: Fewer things means simpler, easier to explain in your pull request description, and easier for a reviewer to reason about. That creates less surprise and more approvals.

## 2: Test Well and Communicate the Pass

Let CICD turn green before you ping a reviewer

Make sure tests are written, type checks, etc, and stated in the PR description

Make sure the tests are rigorous. Consider positive and negative assertions

Manually test when relevant and state in the PR description that you did this

We are simply trying to generate reviewer confidence! Including anticipating and mitigating objections before the reviewer thinks of them

If your code change involves non-determinism, briefly state statistical quality evidence in the pull request as well

## 3: Ask and Socially Pace

One thing that correlates highly to getting a code review is when you ask for a code review

It also turns out that when you ask publicly in a large forum, you are more likely to get a response

There’s a fun trick where you can actually ask more than once

This is often called a “bump”

This relates to a common saying, which is that the squeaky wheel gets the grease

The downside is that if you are too squeaky, it becomes annoying and distracting to the team

The way to have your cake and eat it too, is to socialize and expectation of cadence of bump

So pretty much, everyone is aligned and expects that you should bump with some standard cadence as due diligence of getting your code reviewed

It might be once or twice a day. Whatever the team agrees to

And if you are in multiple teams you can bump in multiple places!

## As an Aside, Let’s Fight Cancer!

Thanks for reading this far. My niece, Noelle, was recently diagnosed with aggressive brain cancer.

Her family has raised 77% of her fundraising goal to help with treatment and care during her time of treatment. [Chip in now here on GoFundMe](https://www.gofundme.com/f/strength-for-noelle-and-the-baumann-family)!

## 4: Leverage Interpersonal Relationships and DMs

Nonprofits have donor lists

If someone donates, they’ve done their fair share right? They shouldn’t be asked to donate again some might think

Wrong. Actually, the most likely potential donor is someone who has already donated

So it is with code review

You are building a relationship with this person, so lean into it

Indeed you are helping them skill up by working with them and if your code is thematic then you are creating subject matter expertise, which becomes a functional reason this other person is a strong reviewer choice

You can pay them back with compliments or positive performance review feedback

## 5: Cheat Safely

You can “cheat” peer review sometimes by merging without a standard human engineer approval

Sometimes this is because you get an AI approval

Sometimes this is because you have merge without approval maintainer permissions

You might also be able get an AI or other human to make the PR for you, then you approve it

Getting “rubber stamps”, non-eng reviews and other low-rigor reviews fall in this bucket

Don’t shy away! Just be responsible. Restrict yourself to doing this with low risk, nonprod, feature flagged, minor etc changes.

You can try it in a risky case too in a pinch, but be prepared to own the outcome when you take down prod and don’t say John recommended it in that case

## 6: Leverage Reciprocity

Compliments not enough? Cool just review their PRs too

You can even be explicit about this and offer to “trade reviews today”

You can also take the lead, sewing seeds of generosity by reviewing others unprompted and helping folks in all kinds of noncoding ways too, then they will naturally tend to reciprocate over time

## 7: Batched Review, Swarm Review, or Live Review

Do a meeting.

It can be a one-on-one meeting or a group meeting. You can review a single PR or multiple PRs (that’s the batch review idea).

You can also implement this in pre-existing meeting, basically exploiting a portion of the meeting time for a quick code review.

I’d be happy if you [subscribe to Current Tech](https://currenttech.substack.com/subscribe) or share this article BUT I WOULD BE MUCH MORE HAPPY IF YOU HELP MY NIECE FIGHT BRAIN CANCER [here at this GoFundMe Link](https://www.gofundme.com/f/strength-for-noelle-and-the-baumann-family). Thank you!

## 8: Onlooker Effects and Peer Pressure

This mainly applies when your code review process requires more than one human approval. In 2026+ that should be a minority of code review processes and you might suggest to the team that a single human approval plus perhaps an AI approval could be sufficient.

The idea here is simple:

1. If someone publicly says your code is great, others will happily approve
2. If someone publicly says your code sucks, others won’t approve

To leverage this, you can:

1. Publicly thank the first reviewer and then ask for a second review. This also leverages the Goal Gradient Effect, where more folks are more likely to help when you are close to finishing a goal.
   1. Speaking of Goal Proximity, my niece Noelle who has aggressive brain cancer has raised 77% of her fundraising goal to help with treatment and care during her time of treatment. [Chip in now here on GoFundMe](https://www.gofundme.com/f/strength-for-noelle-and-the-baumann-family)!
2. If you do have a PR that got lots of review notes or criticism:
   1. Address the notes, then
   2. Hide the original comments once they are addressed OR create an entirely new pull request with the latest and most ideal form of the code, effectively obfuscating to an onlooker or new reviewer that there was ever an issue.

## 9. Quarantine and Derisk

I kind of talked about this under (2) but that was focused on testing.

Basically, use feature flags and write PRs in a low blast radius way.

You can also derisk by communicating planned mitigation and two way doors status and generally by showing you have thought this through and projecting substantiated confidence.
