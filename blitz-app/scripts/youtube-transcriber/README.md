# youtube-transcriber

given a youtube account or playlist, this tool helps us:

1. identify high and low performing videos via `main.py`
2. transcribe a video set into a transcript for LLM usage via `consolidate.py`

Each script file has detailed usage info at the top of the file.

## installation

`poetry install`

## ide compliance

```
poetry config virtualenvs.in-project true
poetry shell
which python
```

then cmd+shift+p -> "Select Python Interpreter" and give VS Code the path identified via `which python`
if you are on windows, don't paste the bash path literal. you should translate that location into Windows syntax

## contribution

please make sure code is properly formatted.
`inv format` runs black through invoke for formatting.
