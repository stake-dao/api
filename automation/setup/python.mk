# Common configuration
PYTHON_VERSION := 3.10.13
VENV_DIR := $(shell pwd)/.venv

# Check if UV is installed
UV_CHECK := $(shell command -v uv 2> /dev/null)

.PHONY: setup-python clean-python install-uv

install-uv:
ifndef UV_CHECK
	@echo "Installing UV..."
	@curl -LsSf https://astral.sh/uv/install.sh | sh
	@echo "UV installed successfully"
else
	@echo "UV is already installed"
endif

setup-python: install-uv
	@echo "Setting up Python $(PYTHON_VERSION) with UV..."
	@uv python install $(PYTHON_VERSION)
	@uv venv --python $(PYTHON_VERSION)
	@echo "Python setup completed. Use 'source .venv/bin/activate' to activate the environment"

clean-python:
	@echo "Cleaning up generated files and directories..."
	rm -rf $(VENV_DIR) .uv
	@echo "Cleanup completed."