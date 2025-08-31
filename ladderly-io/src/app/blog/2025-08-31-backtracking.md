---
title: '38. Five Orders of Backtracking Time Complexity for Interviews'
author: John Vandivier
---

Backtracking algorithms can generate large time complexities of several kinds. One solution is to break out backtracking into subpatterns of more specific algorithms and memorize their complexity. This is a difficult task because:

1. It multiplies the number of patterns you need to memorize.
2. Some subpatterns, like pruning, do not change the time complexity.
3. Understanding the general drivers of time complexity for backtracking allows us to discover and justify high quality implementations, instead of merely reporting the complexity for an implementation which may not be optimal, making us look better in the interview.

Backtracking is a specialized form of depth-first search (DFS). Think of it as a tree or graph navigation problem. Associate the term `backtracking` to the concept of hiking along a trail with many forks. At each fork in the road you could choose to go in various directions, and you may need to go back a few nodes at any point.

This mental model allows us to imagine the many possible routes we could take and the causal drivers that allow the number of routes to be larger or smaller. The collection of such routes gives us the time complexity. The drivers are:

1. The depth of the DFS. This is the length of the journey, or the number of decisions we need to make.
2. The number of choices we have at each fork in the road.
3. Whether we can make the same choice multiple times.
   1. If not, each subsequent iteration has fewer available options.
   2. If so, it's similar to our navigation graph having loops.
4. Whether order matters.
   1. If it does, we call a sequence of selections a permutation.
   2. If it doesn't, we call a sequence of selections a combination.

This article orders time complexity from weakest to strongest performance. This enables systematic and thorough analysis during the interview, leading to a well-justified and high performance implementation.

## Brute-Force: Permute with Replacement

Given a number of elements, the greatest number of sequences are identified by allowing replacement. This enables more possible selections at every step of the iteration.

Given many selections, the number of sequences are far larger if we care about the order they were picked. So, the brute force is intuitively to select with order sensitivity and replacement.

In the case of a coin toss, we can easily see that the sequence is 2^n, where n is the number of coin tosses.

More generally, any collection of letters, numbers, or other elements which may be included or excluded fall into this 2^n binary decision complexity.

In other backtracking problems, there is no exclusivity between including or excluding a single element. Imagine these questions and their associated option count:

1. Would you like to append this particular integer to the path?
2. Would you like to append this particular letter to the path?
3. What integer would you like to use next?
4. What letter would you like to use next?
5. Which note of the major scale will you play next?

You can see that the decision factor is not always two. The general worst-case time complexity for a backtracking algorithm is, therefore, `O(m^n) | n is the number of decisions to be made and m is the number of available options, or choices, at each step`.

## Permute without Replacement

If I toss a coin twice, I might get four different outcomes.

Imagine that I make the following rule: "Whatever happened last time is not allowed to happen again."

Then the second outcome is always known immediately after the first outcome is revealed. So, there are only two possible sequences.

With a die, the possible outcomes at each iteration would be 6, 5, 4...1 and the number of sequences would be the product of this series, which is n!

So, it is a valid and general bound to say that the time complexity is `n!` for permutations without replacement, but we also know it is valid and general to say that `m^n` is a boundary. Interestingly, for some values of m and n, `m^n` is actually a narrower boundary. So, the general constraint when we know that replacement is not allowed is `O(min{m^n, n!})`.

## Few-Step Permutation without Replacement

As discussed, if I roll a die until all numbers have been shown once, I have `n!` possible sequences.

What if I'm only allowed to roll it a few times? I might not be able to roll all six numbers.

If I can only roll it twice, I would have `6 x 5 = 30` possible sequences, or distinct ordered outcomes.

More generally, the formula is to apply a discount factor equal to the total number of options less the number of allowed steps:

$$
O\!\left(\frac{n!}{(n-m)!}\right)
$$

## When Order Doesn't Matter

If order doesn't matter for our count of results, then we call the results combinations rather than permutations.

When we ignore order, permutations duplicate combinations by a factor of `m!`. The time complexity for combinations then adds this factor to the denominator:

$$
O\!\left(\binom{n}{m}\right) \;=\; O\!\left(\frac{n!}{m!(n-m)!}\right)
$$

This faster time complexity is intuitive because we are trying to calculate a smaller set.

In an interview context, if you can't remember this complex formula, try the following:

1. Check for constants (the upcoming section) which will give you a better time complexity anyway.
2. Use the verbal expression "O of n choose m" which is the verbal representation of the left hand expression above. It is mathematically precise even if it is a shorthand. The interviewer may allow this and not require you to write out the low-level formula.
3. Use one of the previously mentioned time complexities.

   a. Because they are worst-case, they aren't strictly wrong, they just aren't as precise a possible.

   b. Notice, for instance, that the above right-hand expression is always bounded by `n!`.

   c. You can optionally state that you know this algorithm is faster even in the worst case, but you can't recall the precise formula. They may ask "how do you know it's faster?" and you will shine if you are able to explain the drivers of time complexity this article has discussed.

## With Finite Decisions

If $n$ and $m$ are fixed constants, the time complexity is $O(1)$.

Examples of this kind of problem include:

1. LeetCode [401. Binary Watch](https://leetcode.com/problems/binary-watch)
2. Leetcode [17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number)

In cases like these, you are able to select from a fixed set options for each iteration with a fixed and finite maximum number of iterations. Cases like these are constant time.

## Space complexity: how to phrase it in interviews

- **Auxiliary / extra space:** what interviewers care about.
  - For backtracking this is typically the recursion depth plus extra space for the path itself. This is the memory space used _other than the output variable_.
- **Output space / Total space:** storing the return list itself costs $\Theta(\#\text{solutions})$ for backtracking algorithms.
  - While this is true, it's not the expected answer in a LeetCode-style interview.
