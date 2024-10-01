# Makefile for vm_all_platforms

include automation/setup/python.mk
include automation/setup/dotenv.mk
include automation/setup/votemarket-proofs-script.mk

# Ensure GIT_ACCESS_TOKEN is set
ifndef GIT_ACCESS_TOKEN
$(error GIT_ACCESS_TOKEN is not set. Please set it in the environment)
endif

# Job-specific targets
.PHONY: all setup install-deps run-vm-all-platforms clean

# Define the default target
.DEFAULT_GOAL := all

all: setup install-deps run-vm-all-platforms

setup: setup-python checkout-votemarket-proofs-script

install-deps: install-votemarket-proofs-script-deps

# Get the current period
get-current-period:
	@echo "Getting the current period..."
	@$(eval CURRENT_PERIOD := $(shell $(PYTHON) -c "import time; print(int(time.time()) - (int(time.time()) % (7 * 24 * 3600)))"))
	@echo "Current period: $(CURRENT_PERIOD)"

run-vm-all-platforms: get-current-period
	@echo "Running vm_all_platforms.py..."
	cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && \
	PYTHONPATH=script \
	$(PYTHON) script/external/vm_all_platforms.py \
	curve fxn balancer frax \
	--period $(CURRENT_PERIOD) && \
	cd - > /dev/null && \
	echo "vm_all_platforms.py completed successfully"

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/votemarket-proofs-script.mk clean-votemarket-proofs-script