# Makefile for vm_active_proofs

include automation/setup/python.mk
include automation/setup/dotenv.mk
include automation/setup/votemarket-proofs-script.mk

# Ensure GIT_ACCESS_TOKEN is set
ifndef GIT_ACCESS_TOKEN
$(error GIT_ACCESS_TOKEN is not set. Please set it in the environment)
endif

# Job-specific targets
.PHONY: all setup install-deps run-vm-active-proofs clean

# Define the default target
.DEFAULT_GOAL := all

all: setup install-deps run-vm-all-platforms run-vm-active-proofs

setup: setup-python checkout-votemarket-proofs-script

install-deps: install-votemarket-proofs-script-deps

# Get the current period
get-current-period:
	@echo "Getting the current period..."
	@$(eval CURRENT_PERIOD := $(shell $(PYTHON) -c "import time; print(int(time.time()) - (int(time.time()) % (7 * 24 * 3600)))"))
	@echo "Current period: $(CURRENT_PERIOD)"

run-vm-all-platforms:
	@$(MAKE) -f automation/get_all_platforms.mk run-vm-all-platforms

run-vm-active-proofs: get-current-period run-vm-all-platforms
	@echo "Running vm_active_proofs.py..."
	cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && \
	PYTHONPATH=script \
	$(PYTHON) script/external/vm_active_proofs.py \
	temp/all_platforms.json $(CURRENT_PERIOD) && \
	cd - > /dev/null && \
	echo "vm_active_proofs.py completed successfully"

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/votemarket-proofs-script.mk clean-votemarket-proofs-script