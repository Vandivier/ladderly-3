import json
import os
import glob
from pathlib import Path

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
    directory = os.path.join(os.path.dirname(__file__), "leetcode-problems")
    
    # Get all JSON files in the directory
    json_files = glob.glob(os.path.join(directory, "*.json"))
    
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
            
            # Get the href as the key
            href = problem["href"]
            
            # If href already exists in merged_problems
            if href in merged_problems:
                # If source is not already "multiple", set it to "multiple"
                if merged_problems[href]["source"] != "multiple":
                    merged_problems[href]["source"] = "multiple"
            else:
                # Add the problem with its source
                problem["source"] = source_name
                merged_problems[href] = problem
    
    # Convert dictionary to list
    merged_list = list(merged_problems.values())
    merged_list.sort(key=lambda x: x["href"])
    
    # Write the merged list to a new JSON file in the data directory
    output_dir = Path('./leetcode-problems')
    output_file = "unified-leetcode-problems.json"
    with open(output_dir / output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_list, f, indent=2)
    
    print(f"Merged {len(merged_list)} problems from {len(json_files)} files into {output_file}")
    print(f"Problems from multiple sources: {sum(1 for p in merged_list if p['source'] == 'multiple')}")

if __name__ == "__main__":
    main()
