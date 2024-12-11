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

all: setup install-deps get-current-epoch run-get-block-data

setup: setup-python checkout-votemarket-proofs-script

install-deps: install-votemarket-proofs-script-deps

# Get the current period
get-current-epoch:
	@echo "Getting the current period..."
	@$(eval CURRENT_EPOCH := $(shell $(PYTHON) -c "import time; print(int(time.time()) - (int(time.time()) % (7 * 24 * 3600)))"))
	@echo "Current period: $(CURRENT_EPOCH)"


run-get-block-data: get-current-epoch
	@echo "Running get_block_data.py..."
	cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && \
	uv run src/votemarket_toolkit/external/vm_block_data.py \
	curve balancer fxn frax \
	--epoch $(CURRENT_EPOCH) && \
	cd - > /dev/null && \
	echo "vm_block_data.py completed successfully"

move-files:
	@echo "Moving files..."
	mkdir -p api/votemarket/block_data/$(CURRENT_EPOCH)
	mv temp/votemarket-proofs-script/temp/*_block_data.json api/votemarket/$(CURRENT_EPOCH)/

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/votemarket-proofs-script.mk clean-votemarket-proofs-script