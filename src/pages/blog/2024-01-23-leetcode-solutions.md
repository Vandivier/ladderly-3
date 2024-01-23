---
title: "7. LeetCode Solutions"
date: 1/23/24
author: John Vandivier
---

This article contains curated solutions to the problems found in the Ladderly Kata.

The Ladderly Leetcode Expanded Kata contains 20 problems, but this solutions article contains more than 20 solutions. That is because we will cover the optimal solution and solutions for some follow-ups or modifications here. For example, we cover the no-sort solution to 3Sum, which is the optimal solution to 3Sum if you are prohibited from sorting, and it is a popular follow-up question during interviews.

This article contains solutions in Python, which is an ideal language for quickly solving technical interview problems due to the many useful built-in data structures and terse syntax with optional types. Feel free to contribute solutions in other languages! In many cases, you can simply ask GPT-4 to convert a solution to another language. Asking GPT-4 to explain code is also an excellent exercise if you run into a snippet that is unclear.

## TwoSum (No Sort)

View this problem on Leetcode [here](https://leetcode.com/problems/two-sum/description/).

```python
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # naive solution is to brute force compare every pair in o(n^2) time
        # but a better approach would be to sort or use a hashmap
        # sorting is slower at o(nlogn) so let's prefer the hasmap for perf
        # mem complexity o(n) in the worst case
        # no need to handle sad path, we are guaranteed a result

        seen = {} # value is the index where complement was seen
        curr_idx = 0

        while curr_idx < len(nums):
            curr_val = nums[curr_idx]
            sought = target-curr_val
            if sought in seen:
                return [seen[sought], curr_idx]

            seen[curr_val] = curr_idx
            curr_idx+=1
```
