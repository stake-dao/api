include automation/setup/python.mk
include automation/setup/dotenv.mk
include automation/setup/votemarket-proofs-script.mk

# Ensure all env are set
ifndef GIT_ACCESS_TOKEN
ifndef ETHEREUM_MAINNET_RPC_URL
ifndef ARBITRUM_MAINNET_RPC_URL
ifndef EXPLORER_KEY
$(error Some environment variables are not set. Please set them in the environment)
endif
endif
endif
endif

# Job-specific targets
.PHONY: all setup install-deps run-vm-active-proofs clean

# Define the default target
.DEFAULT_GOAL := all

# Update the all target to ensure proper setup order
all: setup install-deps run-vm-all-platforms run-vm-active-proofs move-files

# Make setup depend on UV installation explicitly
setup: install-uv setup-python checkout-votemarket-proofs-script

install-deps: install-votemarket-proofs-script-deps

# Get the current period (7 days in seconds = 604800)
get-current-period:
	@echo "Getting the current period..."
	@$(eval CURRENT_EPOCH := $(shell echo $$(( $(shell date +%s) - $(shell date +%s) % 604800 )) ))
	@echo "Current period: $(CURRENT_EPOCH)"

run-vm-all-platforms:
	@$(MAKE) -f automation/get_all_platforms.mk run-vm-all-platforms

run-vm-active-proofs: get-current-period run-vm-all-platforms
	@echo "Running vm_active_proofs.py..."
	cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && \
	uv run src/votemarket_toolkit/external/vm_active_proofs.py \
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
