import json
import os
import glob
from pathlib import Path
import re


def normalize_href(href):
    """Extracts the problem slug from a LeetCode URL."""
    match = re.search(r'problems/([^/]+)', href)
    if match:
        return match.group(1).strip('/')
    return href.strip('/')


def normalize_name(name):
    """Removes leading 'number. ' from problem names."""
    return re.sub(r'^\d+\.\s*', '', name).strip()


def trim_string_values(obj):
    """Trim all string values in the object."""
    if isinstance(obj, dict):
        return {k: trim_string_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [trim_string_values(item) for item in obj]
    elif isinstance(obj, str):
        return obj.strip()
    else:
        return obj


def main():
    # Directory containing the JSON files
    script_dir = os.path.dirname(__file__)
    directory = os.path.join(script_dir, "leetcode-problems")

    # Get all JSON files in the directory, excluding the output file
    json_files = [
        f
        for f in glob.glob(os.path.join(directory, "*.json"))
        if not os.path.basename(f) == "unified-leetcode-problems.json"
    ]

    # Dictionary to store merged problems
    merged_problems = {}

    # Process each JSON file
    for file_path in json_files:
        # Extract source name from filename
        filename = os.path.basename(file_path)
        source_name = filename.replace("leetcode-", "").replace(".json", "")

        # Read and parse JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            problems = json.load(f)

        # Process each problem
        for problem in problems:
            # Trim all string values
            problem = trim_string_values(problem)

            href_key = normalize_href(problem["href"])

            if "name" in problem:
                problem["name"] = normalize_name(problem["name"])

            # If href already exists in merged_problems
            if href_key in merged_problems:
                existing_problem = merged_problems[href_key]

                # Merge sources — keep list of specific sources and add 'multiple' when applicable
                existing_sources = existing_problem.get("source", [])
                if isinstance(existing_sources, str):
                    existing_sources = [existing_sources]
                new_sources = set(existing_sources)
                new_sources.add(source_name)
                if len(new_sources) > 1:
                    new_sources.add("multiple")
                existing_problem["source"] = sorted(list(new_sources))

                # Merge patterns
                new_patterns = set(problem.get("patterns", []))
                if new_patterns:
                    existing_patterns = set(existing_problem.get("patterns", []))
                    merged_patterns = sorted(
                        list(existing_patterns.union(new_patterns))
                    )
                    existing_problem["patterns"] = merged_patterns
            else:
                # Add the problem with its source (as a list)
                problem["source"] = [source_name]
                if "patterns" not in problem:
                    problem["patterns"] = []
                merged_problems[href_key] = problem

    # Convert dictionary to list
    merged_list = list(merged_problems.values())
    merged_list.sort(key=lambda x: x["href"])

    # Write the merged list to a new JSON file in the data directory
    output_dir = Path(directory)
    output_file = "unified-leetcode-problems.json"
    output_dir.mkdir(parents=True, exist_ok=True)  # Ensure directory exists
    with open(output_dir / output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_list, f, indent=2)

    print(
        f"Merged {len(merged_list)} problems from {len(json_files)} files into {output_dir / output_file}"
    )
    print(
        f"Problems from multiple sources: {sum(1 for p in merged_list if (isinstance(p.get('source'), list) and 'multiple' in p['source']) or p.get('source') == 'multiple')}"
    )


if __name__ == "__main__":
    main() 