from pathlib import Path
import json
import os

import pathspec

def read_package_json(script_path):
    """Reads and returns the full content of package.json located three levels up from the script's directory."""
    package_json_path = script_path.parents[2] / "package.json"  # Navigate three levels up

    if not package_json_path.exists():
        return "No package.json file found three levels up from the script directory."

    with open(package_json_path, "r") as file:
        try:
            package_content = file.read()
            return f"Full package.json content:\n{package_content}"
        except Exception as e:
            return f"Error reading package.json file: {e}"


def get_folder_structure(script_path, ignore_file=".gitignore"):
    """Generates a folder structure representation, respecting .gitignore with glob syntax."""
    project_root = script_path.parents[2]
    gitignore_path = project_root / ignore_file

    ignored_paths = None
    if gitignore_path.exists():
        with open(gitignore_path, "r") as file:
            ignored_paths = pathspec.PathSpec.from_lines("gitwildmatch", file)

    folder_structure = []
    for dirpath, dirnames, filenames in os.walk(project_root):
        relative_path = Path(dirpath).relative_to(project_root)
        # Ignore directories if they match .gitignore patterns
        if ignored_paths and ignored_paths.match_file(str(relative_path)):
            continue

        indent = "    " * str(relative_path).count("/")
        folder_structure.append(f"{indent}{relative_path}/")

        for filename in filenames:
            file_path = relative_path / filename
            if not ignored_paths or not ignored_paths.match_file(str(file_path)):
                folder_structure.append(f"{indent}    {filename}")

    return "\n".join(folder_structure)


def create_copilot_instructions():
    """Creates the copilot-instructions.txt file."""
    script_path = Path(__file__).resolve()
    instructions = (
        "Act as an expert web developer to help me resolve a concern. "
        "\n"
        "We are working on the Ladderly.io web project and I will describe the dependencies for the project, "
        "\n"
        "the folder structure, and the data model. Once you have read through these materials, ask any clarifying "
        "\n"
        "questions that you have."
        "\n"
        "If you have no questions, state that you have read through the high-level context "
        "\n"
        "and you are ready to help with the current concern.\n\n"
        "\n"
        "Here is the project.json file for this project which describes the dependencies:\n"
        f"{read_package_json(script_path)}\n\n"
        "Here is the folder structure of the project:\n"
        f"{get_folder_structure(script_path)}"
    )

    output_path = script_path.parent / "copilot-instructions.txt"
    with open(output_path, "w") as file:
        file.write(instructions)

    print(f"copilot-instructions.txt has been created at {output_path}.")

if __name__ == "__main__":
    create_copilot_instructions()
