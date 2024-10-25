# Makefile for vm_active_proofs

include automation/setup/python.mk
include automation/setup/dotenv.mk
include automation/setup/votemarket-proofs-script.mk

# Ensure all env are set
ifndef GIT_ACCESS_TOKEN
ifndef ETHEREUM_MAINNET_RPC_URL
ifndef ARBITRUM_MAINNET_RPC_URL
ifndef ETHERSCAN_TOKEN
$(error Some environment variables are not set. Please set them in the environment)
endif
endif
endif
endif

# Job-specific targets
.PHONY: all setup install-deps run-vm-active-proofs clean

# Define the default target
.DEFAULT_GOAL := all

all: setup install-deps run-vm-all-platforms run-vm-active-proofs move-files

setup: setup-python checkout-votemarket-proofs-script

install-deps: install-votemarket-proofs-script-deps

# Get the current epoch
get-current-epoch:
	@echo "Getting the current epoch..."
	@$(eval CURRENT_EPOCH := $(shell $(PYTHON) -c "import time; print(int(time.time()) - (int(time.time()) % (7 * 24 * 3600)))"))
	@echo "Current epoch: $(CURRENT_EPOCH)"

run-vm-all-platforms:
	@$(MAKE) -f automation/get_all_platforms.mk run-vm-all-platforms

run-vm-active-proofs: get-current-epoch run-vm-all-platforms
	@echo "Running vm_active_proofs.py..."
	cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && \
	PYTHONPATH=script \
	ETHEREUM_MAINNET_RPC_URL=$${ETHEREUM_MAINNET_RPC_URL%=} \
	ARBITRUM_MAINNET_RPC_URL=$${ARBITRUM_MAINNET_RPC_URL%=} \
	$(PYTHON) script/external/vm_active_proofs.py \
	temp/all_platforms.json $(CURRENT_EPOCH) && \
	cd - > /dev/null && \
	echo "vm_active_proofs.py completed successfully"

move-files:
	@echo "Moving files..."
	mkdir -p api/votemarket/$(CURRENT_EPOCH)/
	cp -Rf temp/votemarket-proofs-script/temp/* api/votemarket/$(CURRENT_EPOCH)/
	rm -f api/votemarket/$(CURRENT_EPOCH)/all_platforms.json
	rm -rf temp/votemarket-proofs-script/temp/*
	@echo "Files moved successfully"

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/votemarket-proofs-script.mk clean-votemarket-proofs-script
