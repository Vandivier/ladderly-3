---
title: '3. Ladderly Standard LeetCode Kata'
author: John Vandivier
---

This article describes several problem sets that are designed to help you prepare for technical interviews. Before diving into the problem sets, I describe the history of technical interview prep and how these problems were selected. If you are not interested in this background material, feel free to skip to the problem sets using the table of contents above. Solutions are documented in [this seperate article](/blog/2024-01-23-leetcode-solutions).

Whiteboard interviews featuring leetcode-style coding problems are standard in Big Tech.
They are less common at Tier 2 and Tier 3 companies, but even in those markets these kinds of problems make up a significant proportion of interviews.
As we think about the job search for programmers, two facts are apparent:

1. It's possible to [land a programming role without leetcode](https://github.com/poteto/hiring-without-whiteboards).
2. LeetCode practice is a great return on investment, improving access to more job opportunities, including opportunities with industry-leading compensation.

Importantly, practicing with Ladderly's problem sets can improve your technical interview performance for both leetcode and non-leetcode interviews! How well do LeetCode ratings predict interview performance? See this [article](https://interviewing.io/blog/how-well-do-leetcode-ratings-predict-interview-performance) for the data showing that serious diminishing returns are associated with doing more than 500 questions. Ladderly's largest set has 690 problems, and it's intended as a joke. It's definitely overkill for the vast majority of job seekers.

Given this information, Ladderly.io recommends that you begin your job search before you feel confident with any of these problem sets. Ladderly.io also recommends that you allocate a proportion of your time during the job search and during periods of employment to work on these problems throughout your career, improving your speed to promotion, maximizing compensation, and protecting yourself against the risk of layoffs or similar events.

After you have solved your first problem, we recommend splitting your time 50/50 between trying new problems and revisiting old problems.

## What is LeetCode Kata?

Kata is a term of Japanese origin that refers to a choreographed pattern of martial arts movements. Practicing or drilling kata is a memorization technique that creates muscle memory in addition to the cognitive benefits.

[Code kata](https://en.wikipedia.org/w/index.php?title=Kata&oldid=1177927890#Outside_martial_arts) are code snippets that are repeatedly typed out as a technique for memorizing solutions to programming problems and also to improve productivity or implementation time for those problems.

LeetCode kata are code kata designed sourced from the popular [LeetCode website](http://leetcode.com/).
Ladderly problem sets are crafted with several principles in mind:

1. Unapologetically weaponize repitition, drilling, memorization, and brute force to crush interviews.
2. Provide a beginner-friendly onboarding experience that scales to the senior-plus level.
3. Ensure strong pattern coverage over all types of problems that are frequently asked in interviews.
4. The Ladderly Standard LeetCode Kata should not contain any premium or paywalled questions.
5. Achieve high cognitive load with comfort by:
   1. Starting with easy problems and working up to harder problems in the same pattern
   2. Ordering the patterns themselves so that initial patterns reflect concepts already encountered in project-based learning
   3. Encouraging flow state through pattern grouping and repitition of known problems
   4. Emphasizing timeboxing
   5. Ensuring problems have well-documented solutions

Ladderly recommends timeboxing problem execution to 20 minutes, and reviewing the solution for 10 minutes. It is fine and expected that you will not be able to solve most problems during the first attempt. In later sessions, you will return to the same problem and you can expect incremental improvement. This is an evidence-based technique called [spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition).

## Standard Historical Guidance

[Yangshun Tay](https://www.linkedin.com/in/yangshun/) published the [Blind 75](https://www.teamblind.com/post/New-Year-Gift---Curated-List-of-Top-75-LeetCode-Questions-to-Save-Your-Time-OaM1orEU) in late 2018. It quickly became the best practice guide for Big Tech coding round preparation. It is now outdated. Several resources have improved on it:

1. Many in the tech community began to emphasize the importance of learning patterns over solving specific problems, and [the 14 Patterns article](https://hackernoon.com/14-patterns-to-ace-any-coding-interview-question-c5bb3357f6ed) became a smash hit.
2. Yangshun himself created an updated list called [the Grind 75](https://www.techinterviewhandbook.org/grind75/about), which actually includes 169 problems.
3. Building on the 14 Patterns, Sean Prashad launched the [LeetCode Patterns tool](https://seanprashad.com/leetcode-patterns/), capturing 22 patterns across 174 problems.
4. John Vandivier, the creator of Ladderly.io, created the [5 to 23 Patterns article](https://hackernoon.com/5-to-23-patterns-to-ace-any-coding-interview), embracing both the movement to lower the barrier to entry and also raising the bar on the total addressed pattern set compared to Prashad's tool.
5. LeetCode itself created the [LeetCode 75](https://leetcode.com/studyplan/leetcode-75/), a program targeted around 1-3 months of study and covering many essential patterns.
6. Formation.dev published [The Engineering Method](https://formation.dev/blog/the-engineering-method/), a step-by-step process to solve any leetcode problem
7. [Neetcode.io](https://neetcode.io/) created the bar-raising Neetcode 250
8. [John Vandivier](https://www.linkedin.com/in/john-vandivier/) wrote [6 Problem Picking Patterns for Technical Success](https://hackernoon.com/mastering-leetcode-6-problem-picking-patterns-for-technical-success). This article defines an evergreen process for finding highly relevant problems and patterns at any point in time.
9. Ladderly.io releases our Standard and Expanded LeetCode Kata.
10. [Interviewing.io documents](https://interviewing.io/blog/how-well-do-leetcode-ratings-predict-interview-performance) that serious diminishing returns are associated with doing more than 500 problems.
11. Ladderly.io releases the Ladderly 360, a new best-in-industry large structured problem set.

## The Ladderly Standard LeetCode Kata

Solve these problems in the given order. Step through each problem as if it were a coding interview round and leverage [Formation's Engineering Method](https://formation.dev/blog/the-engineering-method/). That means you should say things out loud as you go:

1. Recite the problem
2. Ask clarifying questions. (Yes, even though you are alone, practice asking a question out loud.)
3. Come up with happy cases and edge cases.
4. Plan by declaring a basic or brute force approach with its worst-case time and space complexity.
   1. Learn more about Big O notation for time and space complexity analysis [here with NeetCode](https://www.youtube.com/watch?v=BgLTDT03QtU).
5. Brainstorm additional approaches and select the pattern most appropriate, with a bias towards minimizing time complexity in a feasible timeframe for implementation.
6. Implement the solution
7. Verify the solution
8. Time permitting, further optimize the solution if possible.

As a practice tool, with timeboxing, you should be able to solve 1-4 problems per session.
This kata is also a fantastic interview preperation and warmup tool!
To prepare for a coding interview, begin this kata 2 hours before the interview, timeboxing kata performance to one hour at most, then take a break and relax before greeting your interviewer.
Remember other basics of preparation including rest, nutrition, hydration, appearance management, and positive mindset!

Here is the list of code challenges in the Ladderly LeetCode Standard Kata:

1. [167. Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

   1. Patterns: Array, Two Pointers, Monotonic Stack
   2. Key Notes:
      1. It is important to check whether an input array is sorted.
      2. There is an important difference between weakly and strictly changing values in an array.
   3. Related Resources: [Monotonic Functions](https://en.wikipedia.org/w/index.php?title=Monotonic_function&oldid=1178555210)

2. [15. 3Sum](https://leetcode.com/problems/3sum/)

   1. Patterns: Array, Two Pointers

3. [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

   1. Patterns: String, Sliding Window

4. [141. Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)

   1. Patterns: Linked List, Two Pointers, Fast and Slow Pointers

5. [234. Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/description/)

   1. Patterns: Linked List, Two Pointers, Fast and Slow Pointers, Recursion

   2. Key Notes:
      1. The only way to avoid O(n) space complexity is to modify the input in place. For that reason, the less obvious partial linked list reversal technique is more efficient compared to creating a copy of the input as an array.

6. [133. Clone Graph](https://leetcode.com/problems/clone-graph/)

   1. Patterns: BFS, DFS, Graphs

7. [207. Course Schedule](https://leetcode.com/problems/course-schedule/)

   1. Patterns: BFS, DFS, Graphs, Topological Sort

8. [210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

9. [112. Path Sum](https://leetcode.com/problems/path-sum/)

   1. Patterns: Tree Algorithms, DFS, BFS

10. [113. Path Sum II](https://leetcode.com/problems/path-sum-ii/)

    1. Patterns: Tree Algorithms, DFS, Recursion

11. [102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)

    1. After completion: Review [other common tree traversal patterns](https://en.wikipedia.org/wiki/Tree_traversal) and their use cases.

12. [79. Word Search](https://leetcode.com/problems/word-search/)

    1. Patterns: Array, Backtracking, Matrix, String

13. [50. Pow(x, n)](https://leetcode.com/problems/powx-n/)

    1. Patterns: Math

14. [13. Roman to Integer](https://leetcode.com/problems/roman-to-integer/)

    1. Patterns: Math, String, Hash Table

## The Ladderly Expanded Kata

The Ladderly Expanded Kata is a list of 28 problems and it is a superset of the standard kata.
It is 28 problems in size, which is exactly twice as long as the standard kata, while still much smaller than other problem sets conventionally used for introductory leetcode study.

These additional challenges cover a broader set of patterns and techniques, such as the prefix sum and priority queue, while also improving reinforcement for minimally covered patterns.

Here is the list of code challenges in The Ladderly Expanded Kata:

1. [167. Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

   1. Patterns: Array, Two Pointers, Monotonic Stack

2. [15. 3Sum](https://leetcode.com/problems/3sum/)

   1. Patterns: Array, Two Pointers

3. [162. Find Peak Element](https://leetcode.com/problems/find-peak-element)

   1. Patterns: Array, Binary Search

4. [79. Word Search](https://leetcode.com/problems/word-search/)

   1. Patterns: Array, Backtracking, Matrix, String

5. [212. Word Search II](https://leetcode.com/problems/word-search-ii/)

   1. Patterns: Array, DFS, Matrix, String, Trie

6. [70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)

   1. Patterns: Math, Dynamic Programming

7. [50. Pow(x, n)](https://leetcode.com/problems/powx-n/)

   1. Patterns: Math

8. [13. Roman to Integer](https://leetcode.com/problems/roman-to-integer/)

   1. Patterns: Math, String, Hash Table

9. [273. Integer to English Words](https://leetcode.com/problems/integer-to-english-words)

   1. Patterns: Math, String, Recursion

10. [1004. Max Consecutive Ones III](https://leetcode.com/problems/max-consecutive-ones-iii/)

    1. Patterns: Array, Sliding Window

11. [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

    1. Patterns: String, Sliding Window

12. [54. Spiral Matrix](https://leetcode.com/problems/spiral-matrix)

    1. Patterns: Array, Matrix

13. [141. Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)

    1. Patterns: Linked List

14. [234. Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/description/)

    1. Patterns: Linked List, Fast and Slow Pointers, Recursion

15. [146. LRU Cache](https://leetcode.com/problems/lru-cache/)

    1. Patterns: Linked List

16. [133. Clone Graph](https://leetcode.com/problems/clone-graph/)

    1. Patterns: BFS, DFS, Graphs

17. [207. Course Schedule](https://leetcode.com/problems/course-schedule/)

    1. Patterns: BFS, DFS, Graphs, Topological Sort

18. [210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

19. [630. Course Schedule III](https://leetcode.com/problems/course-schedule-iii/editorial/)

    1. Patterns: Array, Greedy, Heap / Priority Queue, Memoization, Recursion

20. [112. Path Sum](https://leetcode.com/problems/path-sum/)

    1. Patterns: Tree Algorithms, DFS, BFS

21. [113. Path Sum II](https://leetcode.com/problems/path-sum-ii/)

    1. Patterns: Tree Algorithms, DFS, Recursion

22. [437. Path Sum III](https://leetcode.com/problems/path-sum-iii/)

    1. Patterns: Tree Algorithms, DFS, Prefix Sum

23. [110. Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/)

24. [102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)

    1. After completion: Review [other common tree traversal patterns](https://en.wikipedia.org/wiki/Tree_traversal) and their use cases.

25. [39. Combination Sum](https://leetcode.com/problems/combination-sum/)
26. [51. N-Queens](https://leetcode.com/problems/n-queens/)
27. [37. Sudoku Solver](https://leetcode.com/problems/sudoku-solver/)
28. [340. Longest Substring with At Most K Distinct Characters](https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/).

## Calculating Estimated Coverage

[AlgoMonster estimates](https://algo.monster/problems/stats) the overall proportion of coding round questions by pattern as follows:

1. Depth-First Search: 16.8%
2. Basic Programming 12.6%
3. Two Pointers: 10.5%
4. Linked Lists: 6.3%
5. Breadth-First Search: 4.9%
6. [Math](https://leetcode.com/problem-list/math/): 4.9%
7. [Hash](https://leetcode.com/tag/hash-table/): 4.2%
8. Binary Search 3.5%
9. Stack: 3.5%
10. Heap: 2.8%
11. Dynamic Programming: 2.8%
12. Matrix: 2.1%
13. Bit Manipulation: 2.1%
14. Divide and Conquer: 0.7%
15. Prefix Sum: 0.7%

While this makes up the labeled region of the pie chart the total here is only 78.4%. Other groups like tries and greedy algorithms took up some small and unlabeled slices in the analysis across companies, but they sometimes made significant contributions to company-specific question pools.

The Ladderly Expanded Kata covers all of these except:

1. Dynamic Programming (Technically there's one DP problem but let's consider it not covered)
2. Bit Manipulation
3. Divide and Conquer

Ignoring the unlabeled patterns, The Ladderly Expanded Kata therefore conservatively covers 72.8 (= 78.4 - 0.7 - 2.1 - 2.8) percent of expected questions.

The standard kata further leaves out prefix sum and binary search, so it has 4.2% less coverage. Still, the basic kata conservatively covers more than two-thirds of the expected questions! This is a substantial reduction to your risk at coding challenge time.

## Dangers of Code Kata

There are six main dangers to using code kata from Ladderly or elsewhere:

1. Underutilization. As kata, the benefits will not be realized if you only do these problems a few times. You should practice them many times to the point that you can easily solve any problem on the list without much time or effort.

2. Overutilization. The job search involves more than leetcode. Make time for rest, social networking, applications, portfolio development, working on non-kata code challenges, and the other elements of the job search.

3. Substituting memorization for learning. Kata is a memorization tool, and memorization is not a substitute for learning. While these problems can serve as a starting point for learning, you should continue to study many other variations to reduce the chance that a surprise question or twist during an interview will throw you into a difficult situation. Make a practice of calmly facing unexpected questions by:

   1. Participating in LeetCode weekly competitions
   2. Referring back to the Standard Historical Guidance for continued learning
   3. Taking on many real and practice interviews and viewing them as a learning experience, acknowledging that you may be surprised and accepting it

4. Treating the kata pattern set as an end goal rather than a market of basic competency. Recalling the 5 to 23 Patterns article, notice that only the most important five are covered in the Ladderly Standard LeetCode Kata. These five explain

5. Prioritizing generic kata over company-specific information is a mistake. If you are able to access a company-specific list of frequently used questions, prioritize those. You can use the kata in addition to those tools, or modify the standard kata for your own situation.

6. Neglecting others is a danger of becoming an elite programmer. You may forget how hard it was in the beginning. You may think that since you went through this difficult process other people should also do the same in order to earn their place as a software engineer. At Ladderly, we hope that you adopt an attitude of empathy toward others instead, and we'd welcome your personal support and contributions of time, resources, and effort to ensure that it gets easier for people to break into tech over time.

## SWE 75 Hard

The SWE 75 Hard can be accessed by filtering on source in the [Ladderly LeetCode Tool](https://www.ladderly.io/leetcode-tool). You can also view the list in JSON format [here for free in the open source repository](https://github.com/Vandivier/ladderly-3/blob/main/ladderly-io/scripts/python/leetcode-problems/leetcode-swe-75-hard.json). It is a list of 75 hard leetcode problems selected in an evidence-based way to boost your coding round interview performance.

[Research shows](https://interviewing.io/blog/how-well-do-leetcode-ratings-predict-interview-performance) that completing a LeetCode hard carries over twice the benefits of a medium question.

The problems contained in this list were selected as follows:

1. Pick the hard problems from the Ladderly 360, omitting the SWE 65 Hard. This process identifies 57 problems.
2. Take the 18 most frequent LeetCode hard problems not already identified, as of November 1, 2025.

Feel free to integrate these problems into a transformative mental toughness program like [75 Hard](https://pennstatehealthnews.org/2024/01/the-medical-minute-75-hard-75-soft-and-how-to-keep-your-fitness-resolutions/), [75 Soft](https://pennstatehealthnews.org/2024/01/the-medical-minute-75-hard-75-soft-and-how-to-keep-your-fitness-resolutions/), or another variation, but that's not required.

The SWE 65 Hard is simply the 65 most frequent of the SWE 75 Hard.

## Ladderly 360

The Ladderly 360 is the problem set union of:

1. [Grind 75](https://www.techinterviewhandbook.org/grind75/)
2. [Taro 75](https://www.jointaro.com/interviews/taro-75/)
3. NeetCode 250
4. [Sean Prashad's LeetCode Patterns](https://seanprashad.com/leetcode-patterns/)
5. The Ladderly Expanded Kata
6. SWE 65 Hard

The Ladderly 360 problem set can be explored using the [LeetCode Tool](https://www.ladderly.io/leetcode-tool).

The Ladderly 360 is a work in progress and currently includes 352 problems. Ladderly 360 improves subsumed problem sets with [evidence-based features of coding round preparedness](https://optimality.substack.com/p/contra-interview-when-you-feel-ready):

1. Optimal Volume: Ladderly 360's problem count is in the optimal range of 300-480.
2. Higher Difficulty Density: The Ladderly 360 has a higher proportion of hard problems compared to any subsumed set, and hard problems have a significantly higher association with interview round performance.

Plus, the convenience of the number 360 which is adaptive to study plans in a wide variety of time ranges.

Hard problem recommendations and other comments [are welcome here](https://github.com/Vandivier/ladderly-3/issues/561) as we collectively improve from the existing 352 problem set to the Ladderly 360!

## Ladderly 370

The Ladderly 370 is a useful accident. It is not optimized for return on investment to effort or time. It dips in to diminishing returns, but for someone who wants to further increase total performance, there is scientific reason to expect that the Ladderly 370 will prepare you better than the Ladderly 360: It is simply the Ladderly 360 plus ten more hard problems.

What happened was: The Ladderly 360 was constructed by taking the union of some well-known problem sets, then adding additional hard problems to get to a total of 360 with a higher hard difficulty density. The naive union had 352 problems, so 8 hard problems were added, yielding 65 hard problems.

[75 Hard](https://andyfrisella.com/pages/75hard-info) is already a recognized brand, and many of the existing problem sets are size 75. For SEO, sales, and marketing purposes, Ladderly.io selected ten more hard problems to make the SWE 75 Hard. As a result, if you complete the Ladderly 360 and the full SWE 75 Hard, congrats! You're a real freak and you have completed the Ladderly 370.

## Beyond LeetCode

Besides practing leetcode problems, here are other things you can do to significantly improve your coding round performance:

1. Repetition on these same problems. Drive down your solution time.
   - To pass Meta's coding round, which is among the hardest in the industry, you should be able to solve two medium problems in thirty minutes.
   - Meta gives you a few minutes more in the actual interview, but we recommend targeting practice-time performance with a higher difficulty bar than true interview-time performance.
2. Target recent and high frequency questions at your target company. This won't expand your fundamental skill, but it will help you crush with that specific company.
3. Perform mock or actual interviews, focusing on communication, attitude, and etiquette.
   - Some of the etiquette includes discussing possible solutions and their time and space complexity before writing code, getting agreement on the approach with the interviewer before coding, and proactively moving from implementation to verification.
4. Practice writing test cases.
5. Practice non-leetcode coding round types. Four common kinds include:
   1. DSA without a code compile or premade test cases.
   2. Greenfield practical, project-based, or take-home coding problem.
   3. Brownfield practical, troubleshooting, or feature enhancement problem.
   4. AI assisted practical or project-based coding problem.
