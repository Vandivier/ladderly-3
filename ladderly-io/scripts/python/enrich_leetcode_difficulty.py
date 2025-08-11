#!/usr/bin/env python3
"""
enrich_leetcode_difficulty.py

Reads a JSON array of LeetCode problems with "href" and "name" fields,
fetches canonical title (as name) and difficulty via LeetCode's public REST endpoint,
and writes an enriched JSON file.

Usage:
  python enrich_leetcode_difficulty.py

Optional:
  --timeout 15                       # seconds per HTTP request

This script always reads from and writes to the same JSON file located
at './leetcode-problems/unified-leetcode-problems.json' relative to this script's directory.
"""
import argparse
import json
import re
import sys


import requests
from pathlib import Path

LEETCODE_ALL_PROBLEMS_URL = "https://leetcode.com/api/problems/all/"

SLUG_RE = re.compile(r"https?://leetcode\.com/problems/([^/]+)/?")


def parse_slug(href: str) -> str:
    """
    Extract the problem slug from a LeetCode problem URL.
    """
    m = SLUG_RE.match(href.strip())
    if not m:
        # Fallback: take last non-empty path segment
        slug = href.rstrip("/").split("/")[-1]
        return slug
    return m.group(1)


def make_session(timeout: int = 15) -> requests.Session:
    s = requests.Session()
    s.headers.update(
        {
            "User-Agent": "leetcode-difficulty-enricher/1.0 (+https://leetcode.com)",
            "Content-Type": "application/json",
        }
    )
    s.request_timeout = timeout  # custom attr for convenience
    return s


def fetch_rest_problem_map(
    session: requests.Session,
) -> dict[str, tuple[str | None, str | None]]:
    """
    Public REST fallback. Returns mapping slug -> (title, difficultyName)
    difficulty.level: 1=Easy, 2=Medium, 3=Hard.
    """
    r = session.get(
        LEETCODE_ALL_PROBLEMS_URL, timeout=getattr(session, "request_timeout", 15)
    )
    r.raise_for_status()
    data = r.json() or {}
    pairs = data.get("stat_status_pairs") or []

    level_to_name = {1: "Easy", 2: "Medium", 3: "Hard"}
    problem_map: dict[str, tuple[str | None, str | None]] = {}
    for p in pairs:
        stat = p.get("stat") or {}
        slug = stat.get("question__title_slug")
        title = stat.get("question__title")
        diff_level = (p.get("difficulty") or {}).get("level")
        diff_name = level_to_name.get(diff_level)
        if slug:
            problem_map[slug] = (title, diff_name)

    return problem_map


def enrich_data(
    input_items: list[dict],
    problem_map: dict[str, tuple[str | None, str | None]],
) -> list[dict]:
    """
    Adds 'difficulty' and 'isPaidOnly' fields when available.
    Uses only the bulk map.
    """
    out: list[dict] = []
    misses: list[str] = []
    for item in input_items:
        href = item.get("href", "")
        slug = parse_slug(href)
        title: str | None = None
        diff: str | None = None

        if slug in problem_map:
            title, diff = problem_map[slug]

        new_item = dict(item)
        if title:
            new_item["name"] = title
        if diff is not None:
            new_item["difficulty"] = diff
        new_item["slug"] = slug
        out.append(new_item)

        if diff is None:
            misses.append(slug)

    if misses:
        sys.stderr.write(
            f"[info] Missing difficulty for {len(misses)} slugs (e.g., {misses[:5]})\n"
        )

    return out


def main():
    parser = argparse.ArgumentParser(
        description="Enrich LeetCode problem JSON with canonical name and difficulty via REST."
    )
    parser.add_argument(
        "--timeout", type=int, default=15, help="HTTP timeout per request (seconds)"
    )
    args = parser.parse_args()

    session = make_session(timeout=args.timeout)

    # Resolve the unified problems file path relative to this script
    problems_file_path = (
        Path(__file__).resolve().parent
        / "leetcode-problems"
        / "unified-leetcode-problems.json"
    )

    # Load input
    with open(problems_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        if not isinstance(data, list):
            print("Input must be a JSON array.", file=sys.stderr)
            sys.exit(1)

    # Fetch via REST
    try:
        problem_map = fetch_rest_problem_map(session)
    except Exception as e:
        print(f"[warn] REST fetch failed: {e}", file=sys.stderr)
        problem_map = {}

    # Enrich
    enriched = enrich_data(data, problem_map)

    # Write output
    with open(problems_file_path, "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)

    # Summary
    total = len(enriched)
    got = sum(1 for x in enriched if "difficulty" in x)
    hard = sum(1 for x in enriched if x.get("difficulty") == "Hard")
    print(f"Enriched {got}/{total} items; Hard: {hard}")
    print(f"Wrote: {problems_file_path}")


if __name__ == "__main__":
    main()
