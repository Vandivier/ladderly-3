---
title: '3. Ladderly Standard Leetcode Kata'
author: John Vandivier
---

This article describes several problem sets that are designed to help you prepare for technical interviews. Before diving into the problem sets, I describe the history of technical interview prep and how these problems were selected. If you are not interested in this background material, feel free to skip to the problem sets using the table of contents above. Solutions are documented in [this seperate article](/blog/2024-01-23-leetcode-solutions).

Whiteboard interviews featuring leetcode-style coding problems are standard in Big Tech.
They are less common at Tier 2 and Tier 3 companies, but even in those markets these kinds of problems make up a significant proportion of interviews.
As we think about the job search for programmers, two facts are apparent:

1. It's possible to [land a programming role without leetcode](https://github.com/poteto/hiring-without-whiteboards).
2. Leetcode practice is a great return on investment, improving access to more job opportunities, including opportunities with industry-leading compensation.

Importantly, practicing with Ladderly's problem sets can improve your technical interview performance for both leetcode and non-leetcode interviews! How well do LeetCode ratings predict interview performance? See this [article](https://interviewing.io/blog/how-well-do-leetcode-ratings-predict-interview-performance) for the data showing that serious diminishing returns are associated with doing more than 500 questions. Ladderly's largest set has 690 problems, and it's intended as a joke. It's definitely overkill for the vast majority of job seekers.

Given this information, Ladderly.io recommends that you begin your job search before you feel confident with any of these problem sets. Ladderly.io also recommends that you allocate a proportion of your time during the job search and during periods of employment to work on these problems throughout your career, improving your speed to promotion, maximizing compensation, and protecting yourself against the risk of layoffs or similar events.

After you have solved your first problem, we recommend splitting your time 50/50 between trying new problems and revisiting old problems.

## What is Leetcode Kata?

Kata is a term of Japanese origin that refers to a choreographed pattern of martial arts movements. Practicing or drilling kata is a memorization technique that creates muscle memory in addition to the cognitive benefits.

[Code kata](https://en.wikipedia.org/w/index.php?title=Kata&oldid=1177927890#Outside_martial_arts) are code snippets that are repeatedly typed out as a technique for memorizing solutions to programming problems and also to improve productivity or implementation time for those problems.

Leetcode kata are code kata designed sourced from the popular [Leetcode website](http://leetcode.com/).
Ladderly problem sets are crafted with several principles in mind:

1. Unapologetically weaponize repitition, drilling, memorization, and brute force to crush interviews.
2. Provide a beginner-friendly onboarding experience that scales to the senior-plus level.
3. Ensure strong pattern coverage over all types of problems that are frequently asked in interviews.
4. The Ladderly Standard Leetcode Kata should not contain any premium or paywalled questions.
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
3. Building on the 14 Patterns, Sean Prashad launched the [Leetcode Patterns tool](https://seanprashad.com/leetcode-patterns/), capturing 22 patterns across 174 problems.
4. John Vandivier, the creator of Ladderly.io, created the [5 to 23 Patterns article](https://hackernoon.com/5-to-23-patterns-to-ace-any-coding-interview), embracing both the movement to lower the barrier to entry and also raising the bar on the total addressed pattern set compared to Prashad's tool.
5. LeetCode itself created the [Leetcode 75](https://leetcode.com/studyplan/leetcode-75/), a program targeted around 1-3 months of study and covering many essential patterns.
6. Formation.dev published [The Engineering Method](https://formation.dev/blog/the-engineering-method/), a step-by-step process to solve any leetcode problem
7. [Neetcode.io](https://neetcode.io/) created the bar-raising Neetcode 250
8. [John Vandivier](https://www.linkedin.com/in/john-vandivier/) wrote [6 Problem Picking Patterns for Technical Success](https://hackernoon.com/mastering-leetcode-6-problem-picking-patterns-for-technical-success). This article defines an evergreen process for finding highly relevant problems and patterns at any point in time.
9. Ladderly.io releases our Standard and Expanded Leetcode Kata.
10. [Interviewing.io documents](https://interviewing.io/blog/how-well-do-leetcode-ratings-predict-interview-performance) that serious diminishing returns are associated with doing more than 500 problems.
11. Ladderly.io releases additional problem sets to scale up and past the documented point of serious diminishing returns:
    1. The Ladderly 300
    2. The Ladderly 420
    3. The Ladderly 500
    4. The Ladderly 690

## The Ladderly Standard Leetcode Kata

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

Here is the list of code challenges in the Ladderly Leetcode Standard Kata:

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

   1. Participating in Leetcode weekly competitions
   2. Referring back to the Standard Historical Guidance for continued learning
   3. Taking on many real and practice interviews and viewing them as a learning experience, acknowledging that you may be surprised and accepting it

4. Treating the kata pattern set as an end goal rather than a market of basic competency. Recalling the 5 to 23 Patterns article, notice that only the most important five are covered in the Ladderly Standard Leetcode Kata. These five explain

5. Prioritizing generic kata over company-specific information is a mistake. If you are able to access a company-specific list of frequently used questions, prioritize those. You can use the kata in addition to those tools, or modify the standard kata for your own situation.

6. Neglecting others is a danger of becoming an elite programmer. You may forget how hard it was in the beginning. You may think that since you went through this difficult process other people should also do the same in order to earn their place as a software engineer. At Ladderly, we hope that you adopt an attitude of empathy toward others instead, and we'd welcome your personal support and contributions of time, resources, and effort to ensure that it gets easier for people to break into tech over time.

## Ladderly 300 to 690

Links to problem lists on leetcode are forthcoming. For now, I'll just define the problem selection strategies:

1. Ladderly 300: Neetcode 250, less bit manipulation and DP (43 problems), plus Ladderly Expanded Kata (28 problems), plus 65 hard problems
2. Ladderly 420: Ladderly 300, plus frequent-pattern deltas from Grind 75, Leetcode 75, Prashad's 174, and some extra problems.
3. Ladderly 500: Ladderly 420 plus dynamic programming and some extra problems.
4. Ladderly 690: Total superset of all referenced problem lists inclusive of all patterns, including exotic patterns and pure trivia problems for ultimate overkill and bragging rights with zero respect for ROI on time spent.
