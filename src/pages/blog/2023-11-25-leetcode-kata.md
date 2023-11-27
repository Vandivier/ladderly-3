---
title: "3. Ladderly Leetcode Kata"
date: 11/25/23
author: John Vandivier
---

Whiteboard interviews featuring leetcode-style coding problems are the current standard in Big Tech. It's possible to land a programming role [without intensive whiteboard interview preperation](https://github.com/poteto/hiring-without-whiteboards), but even if you aren't seeking a Big Tech role, this is a valuable skill that will improve your job search performance. The official guidance from Ladderly is to begin your job search even if you don't feel confident with problems like these. Do work on this skill in parallel to your job search, but don't block yourself from starting a job search until you have reached leetcode mastery.

Given that you would like to improve your skill with data structures and algorithms, or leetcode-style coding challenges, where should you begin? This article describes standard advice and builds on top of that advice to provide the Ladderly Leetcode Kata, a series of problems designed to help you warm up and prime engineers of any level for their coding interview rounds.

This article defines kata, describes historical standard guidance for coding round interview preperation, lays out the recommended Ladderly Leetcode Kata, and lastly discusses some potential dangers and pitfalls of kata-oriented preperation.

## What are Leetcode Kata?

Kata is a term of Japanese origin that refers to a choreographed pattern of martial arts movements. Practicing or drilling kata is a memorization technique that creates muscle memory in addition to the cognitive benefits.

[Code kata](https://en.wikipedia.org/w/index.php?title=Kata&oldid=1177927890#Outside_martial_arts) are code snippets that are repeatedly typed out as a technique for memorizing solutions to programming problems and also to improve productivity or implementation time for those problems.

Leetcode kata are code kata designed from a list of code problems from the popular [Leetcode website](http://leetcode.com/). The Ladderly Leetcode Kata are selected with a few criteria in mind:

1. Cover the Top 5 Patterns from the [5 to 23 Patterns article](https://hackernoon.com/5-to-23-patterns-to-ace-any-coding-interview).
2. Warm up the brain, don't exhaust it.
3. Represent high-frequency problems according to Leetcode frequency data. Notice that this makes the Ladderly Leetcode Kata a living guide, in contrast to legacy guides such as the Blind 75.
4. Completable in about thirty minutes.
5. Solutions are well-documented.
6. No premium or paywalled questions.
7. Prefer series problems when possible to encourage flow and reduce cognitive switching costs.

The Ladderly Leetcode Kata are also arranged by the progressive complexity of their patterns, so that every later pattern builds on a former pattern, creating a metaflow at the pattern level:

In order of difficulty, the Top 5 Patterns can be arranged this way:

1. String and Array Manipulation
2. Linked Lists
3. Graphs
4. Tree Algorithms
5. Sorting and Searching

Notice that these concepts are arranged such that we start with primitives, then move to collections of primitives, then we can arrange those collections into graphs and trees, and finally we can sort and search across those collections and structures.

## Standard Historical Guidance: When am I Ready to Interview?

The Blind 75 was a watershed guide that helped spread knowledge on common questions and patterns under assessment at Big Tech whiteboard interviews or coding interview rounds. That advice is dated. Several resources have built on it:

1. The creator of the Blind 75 created an updated list called the Grind 75. [Read more here](https://www.techinterviewhandbook.org/grind75/about).
2. Many in the tech community began to emphasize the importance of learning patterns over solving specific problems, and [the 14 Patterns article](https://hackernoon.com/14-patterns-to-ace-any-coding-interview-question-c5bb3357f6ed) became a smash hit.
3. Building on the 14 Patterns, Sean Prashad launched the Leetcode Patterns tool, capturing 22 patterns across 180 problems.
4. [AlgoExpert and Neetcode.io](https://www.reddit.com/r/leetcode/comments/vt5hyr/neetcode_vs_sean_prashad/) sought to improve over existing resources through high quality educational videos, making learning data structures and algorithms (DS&A) easier and less intimidating.
5. John Vandivier, the creator of Ladderly.io, created the [5 to 23 Patterns article](https://hackernoon.com/5-to-23-patterns-to-ace-any-coding-interview), embracing both the movement to lower the barrier to entry and also raising the bar on the total addressed pattern set compared to Prashad's tool.
6. LeetCode itself created the Leetcode 75, a program targeted around 1-3 months of study and covering many essential patterns.
7. John Vandivier wrote [6 Problem Picking Patterns for Technical Success](https://hackernoon.com/mastering-leetcode-6-problem-picking-patterns-for-technical-success). Building on the 5 to 23 patterns article and other work, this article defines a living, abstract, and evergreen process for finding highly relevant problems and patterns at any point in time.

The current article contributes to the literature by providing a leetcode kata. This kata is a compliment to prior work, not a substitute for prior guidance. Ladderly considers the 6 Problem Picking Patterns article to be the state-of-the-art advice for the broader learning journey. The kata described in this article has a different purpose which is to prime the engineer for a coding interview, rather than to guide the learning journey.

As a secondary purpose, it is possible to use these kata as a stepping stone in the larger learning journey. Ladderly presents two kata here: A standard form and an expanded form. The standard form has twelve challenges and the expanded form has twenty challenges. As such, this article represents a new cutting-edge in a reduced barrier to entry for leetcode-style technical interview preperation. The standard kata can be sufficient for entry-level technical interview preperation, although it is not optimal for senior level job seekers. Here is a relevant quote from the [5 to 23 Patterns](https://hackernoon.com/5-to-23-patterns-to-ace-any-coding-interview) article, but do browse it further for additional context:

> I think interviews themselves are excellent practice, and I hesitate to require too much studying in a blocking way before beginning interviews...Whatever problem you are given, let’s target solving the problem in 20 minutes. With that context in mind, here are some of my recommendations by job level:
>
> 1. Entry/Junior Level: Feel confident solving an easy from the Top 7 Patterns in 20 minutes.
>
> 2. SWE II to III...Feel somewhat comfortable (better than 25% chance of success) solving a hard from the Top 11 Patterns in 40 minutes. Consider training with a service like [interviewing.io](https://iio.sh/r/1OhF) or practicing until getting a green light from another current Big Tech engineer.

{{ BlogCallToAction }}

## The Ladderly Leetcode Kata

Solve these problems in order. Step through each problem as if it is a coding interview round. That means you should say things out loud as you go:

1. Recite the problem
2. Ask clarifying questions. (Yes, even though you are alone, practice asking a question out loud.)
3. Declare a basic or brute force approach with its best conceivable runtime.
4. Implement the brute force
5. Ask how the solution can be improved
6. Implement the optimal form (if it is different than the brute force)
7. Declare the worst-case time and space complexity
8. If the kata has a finishing statement, recite the statement out loud before proceeding to the next problem.

As a beginner, you might only be able to solve one problem each day. Eventually, you will have solved these many times and you should be able to complete all steps for all standard kata problems in under 30 minutes. Ideally this kata is performed 1-2 hours in advance of the interview round, allowing for at least 30 minutes of rest time before beginning the interview. Make sure to eat, hydrate, sleep the night before, mind your attitude and attire, and remind yourself of all of those non-technical aspects of the interview during your rest period.

Here is the list of code challenges in the Ladderly Leetcode Standard Kata:

1. [167. Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

   1. Patterns: Array, Two Pointers, Monotonic Stack
   2. Finishing Statement: I recognize the importance of checking whether an input array is sorted. I recognize the importance of distinguishing between weakly and strictly changing values in an array.
   3. Related Resources: [Monotonic Functions](https://en.wikipedia.org/w/index.php?title=Monotonic_function&oldid=1178555210)

2. [15. 3Sum](https://leetcode.com/problems/3sum/)

   1. Patterns: Array, Two Pointers
   2. Finishing Statement: I am comfortable with many variations of two and three sum. I recognize and anticipate the basic forms of these questions and their follow-up complications. For example, the optimal solution to two sum differs when the input is sorted ahead of time. Two Pointers sets me up well for variations like [3Sum Closest](https://leetcode.com/problems/3sum-closest/) and [4Sum](https://leetcode.com/problems/4sum). I recognize that I can sort three sum and higher without an asymptotic performance penalty because optimal sorting performance is O(nlogn).
   3. Note: Write out each of the three solutions: Two Pointers, Hashset, and No-Sort.

3. [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

   1. Patterns: String, Sliding Window

4. [141. Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)

   1. Patterns: Linked List

5. [234. Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/description/)

   1. Patterns: Linked List, Fast and Slow Pointers, Recursion
   2. Finishing Statement: I realize that the only way to avoid O(n) space complexity is to modify the input in-place. For that reason, I realize that the less obvious partial linked list reversal technique is more efficient compared to creating a copy of the input as an array. I also realize that recursion creates O(n) space complexity along the runtime stack. Therefore recursion is also not optimal.

6. [133. Clone Graph](https://leetcode.com/problems/clone-graph/)

   1. Patterns: BFS, DFS, Graphs

7. [207. Course Schedule](https://leetcode.com/problems/course-schedule/)

   1. Patterns: BFS, DFS, Graphs, Topological Sort

8. [210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

9. [112. Path Sum](https://leetcode.com/problems/path-sum/)

   1. Tree Algorithms, DFS, BFS

10. [113. Path Sum II](https://leetcode.com/problems/path-sum-ii/)

    1. Tree Algorithms, DFS, Recursion

11. [102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)

    1. finishing statement: saying the tree traversal orders and when each one should be used

12. [79. Word Search](https://leetcode.com/problems/word-search/)

    1. Patterns: Array, Backtracking, Matrix, String

## The Ladderly Leetcode Expanded Kata

The Ladderly Leetcode Expanded Kata is a list of 21 challenges that are a superset of the standard kata.
The additional challenges cover a broader set of patterns and techniques, such as the prefix sum and priority queue, while also improving reinforcement for minimally covered patterns.

This expanded kata will frequently take an hour for even experienced leetcoders. If you find the expanded kata to be exhausting, consider running this kata the day or weekend before interviews and only doing the standard kata on interview day.

The 21 challenges are intentionally divided into three groups of seven, so you have the option to tackle one group at a time:

1. Group 1, 8 Problems, Covers String and Array Manipulation
2. Group 2, 8 Problems, Covers Linked Lists and Graphs
3. Group 3, 4 Problems, Covers Tree Algorithms and Topological Sort

Here is the list of code challenges in the Ladderly Leetcode Expanded Kata:

1.  [167. Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

    1. Patterns: Array, Two Pointers, Monotonic Stack

    2. Finishing Statement: I recognize the importance of checking whether an input array is sorted. I recognize the importance of distinguishing between weakly and strictly changing values in an array.

    3. Related Resources: [Monotonic Functions](https://en.wikipedia.org/w/index.php?title=Monotonic_function&oldid=1178555210)

2.  [15. 3Sum](https://leetcode.com/problems/3sum/)

    1. Patterns: Array, Two Pointers

    2. Finishing Statement: I am comfortable with many variations of two and three sum. I recognize and anticipate the basic forms of these questions and their follow-up complications. For example, the optimal solution to two sum differs when the input is sorted ahead of time. Two Pointers sets me up well for variations like [3Sum Closest](https://leetcode.com/problems/3sum-closest/) and [4Sum](https://leetcode.com/problems/4sum). I recognize that I can sort three sum and higher without an asymptotic performance penalty because optimal sorting performance is O(nlogn).

    3. Note: Write out each of the three solutions: Two Pointers, Hashset, and No-Sort.

3.  [16. 3Sum Closest](https://leetcode.com/problems/3sum-closest/description/)

    1. Patterns: Array, Two Pointers, Binary Search

4.  [1004. Max Consecutive Ones III](https://leetcode.com/problems/max-consecutive-ones-iii/)

5.  [79. Word Search](https://leetcode.com/problems/word-search/)

    1. Patterns: Array, Backtracking, Matrix, String

6.  [212. Word Search II](https://leetcode.com/problems/word-search-ii/)

    1. Patterns: Array, DFS, Matrix, String, Trie

7.  [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

    1. Patterns: String, Sliding Window

8.  [54. Spiral Matrix](https://leetcode.com/problems/spiral-matrix)

    1. Patterns: Array, Matrix

9.  [141. Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)

    1. Patterns: Linked List

10. [234. Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/description/)

    1. Patterns: Linked List, Fast and Slow Pointers, Recursion

    2. Finishing Statement: I realize that the only way to avoid O(n) space complexity is to modify the input in-place. For that reason, I realize that the less obvious partial linked list reversal technique is more efficient compared to creating a copy of the input as an array. I also realize that recursion creates O(n) space complexity along the runtime stack. Therefore recursion is also not optimal.

11. [146. LRU Cache](https://leetcode.com/problems/lru-cache/)
    Patterns: Linked List

12. [133. Clone Graph](https://leetcode.com/problems/clone-graph/)

    1. Patterns: BFS, DFS, Graphs

13. [207. Course Schedule](https://leetcode.com/problems/course-schedule/)

    1. Patterns: BFS, DFS, Graphs, Topological Sort

14. [210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

15. [630. Course Schedule III](https://leetcode.com/problems/course-schedule-iii/editorial/)

    1. Patterns: Array, Greedy, Heap / Priority Queue, Memoization, Recursion

16. [112. Path Sum](https://leetcode.com/problems/path-sum/)

    1. Tree Algorithms, DFS, BFS

17. [113. Path Sum II](https://leetcode.com/problems/path-sum-ii/)

    1. Tree Algorithms, DFS, Recursion

18. [437. Path Sum III](https://leetcode.com/problems/path-sum-iii/)

    1. Tree Algorithms, DFS, Prefix Sum

19. [110. Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/)

20. [102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)
    1. finishing statement: saying the tree traversal orders and when each one should be used

{{ BlogCallToAction }}

## Honorable Mentions

1. [Combination Sum](https://leetcode.com/problems/combination-sum/) and [N-Queens](https://leetcode.com/problems/n-queens/) for backtracking. Both of these are series problems.
2. Sudoku problems like [37. Sudoku Solver](https://leetcode.com/problems/sudoku-solver/). These are great for learning string matrix algorithms, but they are more cognitively demanding compared to word search with no added pattern coverage. For learning as opposed to kata, Sudoku's higher cognitive load makes it an even better choice than word search. Of course, you can do both for even more load!
3. For additional drilling on sliding window, consider the premium question [340. Longest Substring with At Most K Distinct Characters](https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/).

## Calculating Estimated Coverage

[AlgoMonster estimates](https://algo.monster/problems/stats) the overall proportion of coding round questions by pattern as follows:

1. Depth-First Search: 16.8%
2. Basic Programming 12.6%
3. Two Pointers: 10.5%
4. Linked Lists: 6.3%
5. Breadth-First Search: 4.9%
6. Math: 4.9%
7. [Hash](https://leetcode.com/tag/hash-table/): 4.2%
8. Binary Search 3.5%
9. Stack: 3.5%
10. Heap: 2.8%
11. Dynamic Programming: 2.8%
12. Matrix: 2.1%
13. Bit Manipulation: 2.1%
14. Divide and Conquer: 0.7%
15. Prefix Sum: 0.7%

While this makes up the labeled region of the pie chart the total here is only 78.4%. Other groups like tries and greedy algorithms took up some small and unlabeled slice overall, but they sometimes made significant contributions to company-specific question pools.

The Ladderly Leetcode Expanded Kata covers all of these except:

1. Dynamic Programming
2. Bit Manipulation
3. Divide and Conquer

Ignoring the unlabeled patterns, the Ladderly Leetcode Expanded Kata therefore conservatively covers foo 72.8 (= 78.4 - 0.7 - 2.1 - 2.8) percent of expected questions.

The standard kata further leaves out prefix sum and binary search, so it has 4.2% less coverage. Still, the basic kata conservatively covers more than two-thirds of expected questions! This is a substantial reduction to your risk at coding challenge time.

## Dangers of Code Kata

There are six main dangers to using code kata from Ladderly or elsewhere:

1. Underutilization. As kata, the benefits will not be realized if you only do these problems a few times. You should practice them many times to the point that you can easily solve any problem on the list without much time or effort.
2. Overutilization. The job search involves more than leetcode. Make time for rest, social networking, applications, portfolio development, working on non-kata code challenges, and the other elements of the job search.
3. Substituting memorization for learning. Kata are a memorization tool, and memorization is not a substitute for learning. While these problems can serve as a starting point for learning, you should continue to study many other variations to reduce the chance that a surprise question or twist during an interview will throw you into a difficult situation. Make a practice of calmly facing unexpected questions by:
   1. Participating in Leetcode weekly competitions
   2. Referring back to the Standard Historical Guidance for continued learning
   3. Taking on many real and practice interviews and viewing them as a learning experience, acknowledging that you may be surprised and accepting it
4. Treating the kata pattern set as an end goal rather than a market of basic competency. Recalling the 5 to 23 Patterns article, notice that only the most important five are covered in the Ladderly Leetcode Kata. These five explain
5. Prioritizing generic kata over company-specific information is a mistake. If you are able to access a company-specific list of frequently used questions, prioritize those. You can use the kata in addition to those tools, or modify the standard kata for your own situation.
6. Neglect for others is a danger of becoming an elite programmer. You may forget how hard it was in the beginning. You may think that since you went through this difficult process other people should also do the same in order to earn their place as a software engineer. At Ladderly, we hope that you adopt an attitude of empathy to others instead, and we'd welcome your personal support and contributions of time, resources, and effort to ensure that it gets easier for people to break into tech over time.

{{ BlogCallToAction }}

## Now for a Little Fun!

In order to motivate community participation and conversation, Ladderly is providing a special reward to our users that publish a video of an attempt to complete either of the kata.

After creating a free or paid account on Ladderly, upload or stream a kata attempt to the platform of your choice. The upload must be publicly accessible and mention this article in the video or in the video description. Then, send the video to the Ladderly team through Discord and we will add a special achievement badge to your profile with a public congratulations over social media!

Here are the reward tiers:

1. Ladderly Kata Participant: Attempt at least one problem from either kata
2. Ladderly Kata Completionist: Complete all 12 problems from the Standard Kata in under 8 hours
3. Ladderly Expanded Kata Completionist: Complete all 20 problems from the Expanded Kata in under 8 hours
4. Ladderly Bronze Star: Complete the standard kata in under 4 hours
5. Ladderly Silver Star: Complete the standard kata in under 1 hour
6. Ladderly Gold Star: Complete the standard kata in under 30 minutes
7. Ladderly Expanded Bronze Star: Complete the expanded kata in under 4 hours
8. Ladderly Expanded Silver Star: Complete the expanded kata in under 2 hours
9. Ladderly Expanded Gold Star: Complete the expanded kata in under 1 hour
10. Laddery Gold Crown: Be a former record holder for completion time of any kata
11. Laddery Diamond Crown: Be the current record holder for completion time of any kata
