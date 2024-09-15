# youtube-transcriber

given a youtube account or playlist, this tool helps us:

1. create a channel performance report with `report.py`
2. save video data with `main.py`
3. create a single-file transcript from saved video data for LLM usage via `consolidate.py`
4. developer tools like formatting in `tasks.py`

Each script file has detailed usage info at the top of the file.

## installation and usage

copy the template environment file and populate appropriate values:

```bash
cp .env.template .env
```

navigate to the directory containing this README in a terminal and create a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
```

install the requirements file and run your script of choice!

```bash
python3 -m pip install -r requirements.txt
python3 report.py
```

Python 3.12.x is currently supported.

## contribution

please make sure code is properly formatted.
`inv format` runs black through invoke for formatting.
