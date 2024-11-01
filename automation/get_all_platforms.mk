# Makefile for vm_all_platforms

include automation/setup/python.mk
include automation/setup/dotenv.mk
include automation/setup/votemarket-proofs-script.mk

# Ensure all env are set
ifndef GIT_ACCESS_TOKEN
ifndef ETHEREUM_MAINNET_RPC_URL
$(error Some environment variables are not set. Please set them in the environment)
endif
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
	@$(eval CURRENT_EPOCH := $(shell $(PYTHON) -c "import time; print(int(time.time()) - (int(time.time()) % (7 * 24 * 3600)))"))
	@echo "Current period: $(CURRENT_EPOCH)"


run-vm-all-platforms: get-current-period
	@echo "Running vm_all_platforms.py..."
	cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && \
	PYTHONPATH=script \
	ETHEREUM_MAINNET_RPC_URL=$${ETHEREUM_MAINNET_RPC_URL%=} \
	ARBITRUM_MAINNET_RPC_URL=$${ARBITRUM_MAINNET_RPC_URL%=} \
	$(PYTHON) script/external/vm_all_platforms.py \
	curve balancer fxn frax \
	--epoch $(CURRENT_EPOCH) \
	$(if $(BLOCK_NUMBER),--block $(BLOCK_NUMBER)) && \
	cd - > /dev/null && \
	echo "vm_all_platforms.py completed successfully"

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/votemarket-proofs-script.mk clean-votemarket-proofs-script