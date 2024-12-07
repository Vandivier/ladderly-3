# Ladderly.io Python Scripts

## installation and usage

navigate to the directory containing this README in a terminal, install `uv`, then install the dependencies:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
uv sync
uv pip install -r pyproject.toml
```

now you can run your script of choice! For example:

```bash
uv run create-copilot-instructions.py
```
