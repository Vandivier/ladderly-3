from pathlib import Path
import os

import pathspec


def read_package_json(script_path):
    """Reads and returns the full content of package.json located three levels up from the script's directory."""
    package_json_path = (
        script_path.parents[2] / "package.json"
    )  # Navigate three levels up

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
    migrations_dir_parts = ("prisma", "migrations")

    ignored_paths = None
    if gitignore_path.exists():
        with open(gitignore_path, "r") as file:
            ignored_paths = pathspec.PathSpec.from_lines("gitwildmatch", file)

    folder_structure = []
    for dirpath, dirnames, filenames in os.walk(project_root):
        relative_path = Path(dirpath).relative_to(project_root)
        relative_path_parts = relative_path.parts

        # Check if the current directory is a subdirectory of prisma/migrations
        is_migrations_subdir = (
            len(relative_path_parts) > len(migrations_dir_parts)
            and relative_path_parts[: len(migrations_dir_parts)] == migrations_dir_parts
        )

        if is_migrations_subdir:
            # Skip all subdirectories within prisma/migrations
            dirnames[:] = []  # Clear dirnames to prevent further traversal
            continue

        # Ignore directories if they match .gitignore patterns
        # Use str(relative_path) for matching as pathspec expects strings
        if ignored_paths and ignored_paths.match_file(str(relative_path)):
            dirnames[:] = []  # Prevent traversal if the directory is ignored
            continue

        # Calculate indentation based on the depth
        indent = "    " * (len(relative_path_parts) - 1) if relative_path_parts else ""
        # Use '/' for consistent path separator display
        folder_structure.append(f"{indent}{relative_path.as_posix()}/")

        for filename in filenames:
            file_path = relative_path / filename
            file_path_parts = file_path.parts

            # Check if the file is within a subdirectory of prisma/migrations
            is_migrations_subdir_file = (
                len(file_path_parts)
                > (
                    len(migrations_dir_parts) + 1
                )  # Ensure it's in a sub-folder, not directly in migrations
                and file_path_parts[: len(migrations_dir_parts)] == migrations_dir_parts
            )

            # Special case: allow migration_lock.toml directly under prisma/migrations
            is_migration_lock_toml = (
                len(file_path_parts) == (len(migrations_dir_parts) + 1)
                and file_path_parts[: len(migrations_dir_parts)] == migrations_dir_parts
                and filename == "migration_lock.toml"
            )

            if is_migrations_subdir_file and not is_migration_lock_toml:
                continue  # Skip files deep within migrations subdirectories

            if not ignored_paths or not ignored_paths.match_file(str(file_path)):
                # Adjust indent for files
                file_indent = "    " * len(relative_path_parts)
                folder_structure.append(f"{file_indent}{filename}")

    # Remove the first element which is "./"
    if folder_structure and folder_structure[0] == "./":
        folder_structure.pop(0)

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
