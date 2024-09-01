# youtube-transcriber

given a youtube account or playlist, this tool helps us:

1. create a channel performance report with `report.py`
2. save video data with `main.py`
3. create a single-file transcript from saved video data for LLM usage via `consolidate.py`
4. developer tools like formatting in `tasks.py`

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
