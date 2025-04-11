instructions:
	cd ladderly-io/scripts/python/ && uv run create-copilot-instructions.py && cd ../../..

clean-branches:
	git branch --merged | egrep -v "(^\*|main)" | xargs git branch -d
