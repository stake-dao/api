# Makefile for vm_active_proofs

include automation/setup/python.mk
include automation/setup/dotenv.mk
include automation/setup/votemarket-proofs-script.mk

# Ensure all env are set
ifndef GIT_ACCESS_TOKEN
ifndef ETHEREUM_MAINNET_RPC_URL
ifndef ARBITRUM_MAINNET_RPC_URL
$(error Some environment variables are not set. Please set them in the environment)
endif
endif
endif

# Job-specific targets
.PHONY: all setup install-deps run-vm-active-proofs clean

# Define the default target
.DEFAULT_GOAL := all

all: setup install-deps install-solc run-vm-all-platforms run-vm-active-proofs move-files

setup: setup-python checkout-votemarket-proofs-script

install-deps: install-votemarket-proofs-script-deps

# Add this new target
install-solc:
	@echo "Installing Solidity compiler..."
	$(PYTHON) -m pip install py-solc-x
	$(PYTHON) -c "from solcx import install_solc, set_solc_version; install_solc(version='0.8.19'); set_solc_version('0.8.19')"

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
	$(PYTHON) -c "from solcx import set_solc_version; set_solc_version('0.8.19')" && \
	$(PYTHON) script/external/vm_active_proofs.py \
	temp/all_platforms.json $(CURRENT_EPOCH) && \
	cd - > /dev/null && \
	echo "vm_active_proofs.py completed successfully"

move-files:
	@echo "Moving files..."
	mkdir -p api/votemarket/$(CURRENT_EPOCH)/
	mv temp/votemarket-proofs-script/temp/* api/votemarket/$(CURRENT_EPOCH)/
	rm api/votemarket/$(CURRENT_EPOCH)/all_platforms.json

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/votemarket-proofs-script.mk clean-votemarket-proofs-script
