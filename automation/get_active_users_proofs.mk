# Makefile

include automation/setup/python.mk
include automation/setup/dotenv.mk
include automation/setup/votemarket-proofs-script.mk

# Ensure GIT_ACCESS_TOKEN is set
ifndef GIT_ACCESS_TOKEN
$(error GIT_ACCESS_TOKEN is not set. Please set it in the environment)
endif

# Job-specific targets
.PHONY: all setup install-deps run-vm-set-block run-set-block-data clean

# Define the default target
.DEFAULT_GOAL := all

all: setup install-deps run-vm-set-block run-set-block-data

setup: setup-python checkout-votemarket-proofs-script

install-deps: install-votemarket-proofs-script-deps

run-vm-set-block:
	@echo "Running vm_set_block.py..."
	PYTHONPATH=$(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)/script $(PYTHON) $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)/script/integration/vm_set_block.py && \
	echo "vm_set_block.py completed successfully"

run-set-block-data: run-vm-set-block
	@echo "Running set_block_data.py..."
	PYTHONPATH=$(AUTOMATION_DEVOPS_DIR)/script $(PYTHON) $(AUTOMATION_DEVOPS_DIR)/script/votemarket/x-chain/vm_set_block.py "$$(cat temp/current_period_block_data.json)" && \
	echo "set_block_data.py completed successfully"

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/votemarket-proofs-script.mk clean-votemarket-proofs-script