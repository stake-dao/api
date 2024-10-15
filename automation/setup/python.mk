# Common configuration
PYTHON_VERSION := 3.10.13
VENV_DIR := $(shell pwd)/venv
PYTHON := $(VENV_DIR)/bin/python
PIP := $(VENV_DIR)/bin/pip

.PHONY: setup-python clean-python

setup-python: $(VENV_DIR)/bin/activate

$(VENV_DIR)/bin/activate:
	@echo "Setting up Python $(PYTHON_VERSION)..."
	@python --version | grep -q "Python $(PYTHON_VERSION)" || { echo >&2 "Python $(PYTHON_VERSION) is required but it's not the default version. Try setting up the correct version with pyenv global $(PYTHON_VERSION), and run this script again. Note: You should run eval \"\$$(pyenv init -)\" before executing this command."; exit 1; }
	python -m venv $(VENV_DIR)
	$(PIP) install --upgrade pip

clean-python:
	@echo "Cleaning up generated files and directories..."
	rm -rf $(VENV_DIR)
	@echo "Cleanup completed."