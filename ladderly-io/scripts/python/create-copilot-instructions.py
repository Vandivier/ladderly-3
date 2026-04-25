from pathlib import Path
import os
import textwrap

import pathspec

# Appended to AGENTS.md after generated package.json and folder listing.
# Edit this block when team agent instructions change—do not add that content
# to AGENTS.md by hand, or the next run of this script will remove it.
AGENTS_MD_STATIC_TAIL = (
    textwrap.dedent(
        """
        ## Agent skills, rules, and repository scope

        - **Project skills** for this repository live under **`.claude/skills/<skill-name>/SKILL.md`**. The team can commit them so everyone shares the same agent workflows; Cursor (and compatible tools) also load these paths.
        - **Rule and skill change requests are repo-local by default:** When the user asks to add or change a rule, skill, or how the agent should behave, apply edits **only inside this repository** (for example `.claude/skills/`, and project `.cursor/` only if they want Cursor-specific config checked in). Do **not** add or change files under home-directory paths (e.g. `~/.cursor/`, `~/.claude/`) or anywhere outside the clone unless the user **explicitly** requests a global or user-level install.
        - **Git and GitHub writes:** Follow the project skill **`deny-default-git-writes`** (`.claude/skills/deny-default-git-writes/SKILL.md`): do not run agent-driven `git commit`, `git push`, or history-mutating git commands, or equivalent `gh` operations, unless the user clearly asks for that in the current message. Read-only commands are fine. Some skills add a **narrow `gh` allowlist** (e.g. `match-or-create-github-issue`); when those apply, follow the skill; they do not allow commits or push by default.

        Other Rules:

        - Prefer `getServerAuthSession` on server components over using `useSession` on client components where possible.
        """
    ).strip()
    + "\n"
)


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
    project_root = script_path.parents[3]
    gitignore_path = project_root / ignore_file
    migrations_dir_parts = ("prisma", "migrations")

    ignored_paths = None
    if gitignore_path.exists():
        with open(gitignore_path, "r") as file:
            ignored_paths = pathspec.PathSpec.from_lines("gitwildmatch", file)

    folder_structure = []
    for dirpath, dirnames, filenames in os.walk(project_root):
        # Never list or traverse .git (huge and not useful in AGENTS.md)
        dirnames[:] = [d for d in dirnames if d != ".git"]

        relative_path = Path(dirpath).relative_to(project_root)
        relative_path_parts = relative_path.parts

        if ".git" in relative_path_parts:
            dirnames[:] = []
            continue

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

        # Sort dirnames and filenames alphabetically
        dirnames.sort()
        filenames.sort()

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

            if ".git" in file_path.parts:
                continue

            if not ignored_paths or not ignored_paths.match_file(str(file_path)):
                # Adjust indent for files
                file_indent = "    " * len(relative_path_parts)
                folder_structure.append(f"{file_indent}{filename}")

    # Remove the first element which is "./"
    if folder_structure and folder_structure[0] == "./":
        folder_structure.pop(0)

    return "\n".join(folder_structure)


def create_copilot_instructions():
    """Writes `AGENTS.md` at the repository root (three levels above this file)."""
    script_path = Path(__file__).resolve()
    instructions = (
        "# AI Assistant Instructions"
        "\n\n"
        "Act as an expert web developer to help me resolve a concern."
        "\n"
        "We are working on the Ladderly.io web project and I will describe the dependencies for the project,"
        "\n"
        "the folder structure, and the data model. Once you have read through these materials, ask any clarifying"
        "\n"
        "questions that you have."
        "\n"
        "If you have no questions, state that you have read through the high-level context"
        "\n"
        "and you are ready to help with the current concern."
        "\n\n"
        "Here is the project.json file for this project which describes the dependencies:\n"
        f"{read_package_json(script_path)}\n\n"
        "Here is the folder structure of the project:\n"
        f"{get_folder_structure(script_path)}\n\n"
        f"{AGENTS_MD_STATIC_TAIL}"
    )

    output_path = script_path.parents[3] / "AGENTS.md"
    with open(output_path, "w") as file:
        file.write(instructions)

    print(f"AGENTS.md has been created at {output_path}.")


if __name__ == "__main__":
    create_copilot_instructions()
