# Ladderly.io Python Scripts

## installation and usage

navigate to the directory containing this README in a terminal, install `uv`, then install the dependencies:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env # on Windows: source .venv/Scripts/activate
uv sync
uv pip install -r pyproject.toml
```

now you can run your script of choice! For example:

```bash
uv run python create-copilot-instructions.py
```

`create-copilot-instructions.py` writes the repository root `AGENTS.md`. The **closing sections** of that file (agent skills / rules / `Other Rules`) are defined in the script as `AGENTS_MD_STATIC_TAIL`—**edit the script**, not those paragraphs in `AGENTS.md`, or the next run will overwrite them. The **folder list** in `AGENTS.md` omits `.git/`.
