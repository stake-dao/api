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

# Proof generation mode (toolkit README, "Bulk eth_getProof" and "Batch verifier artifacts"):
#   VM_BULK_PROOFS=1 (default) groups the storage keys of a gauge into few eth_getProof calls
#   and publishes the batch-verifier artifacts (curve, balancer, fxn) next to the legacy proofs;
#   VM_BULK_PROOFS=0 restores one eth_getProof per proof (legacy fields are identical either way).
#   VM_BULK_KEYS_PER_CALL and VM_BATCH_MAX_BYTES are optional tuning knobs (empty = toolkit default).
VM_BULK_PROOFS ?= 1
VM_BULK_KEYS_PER_CALL ?=
VM_BATCH_MAX_BYTES ?=
VM_ACTIVE_PROOFS_FLAGS := $(if $(filter 1,$(VM_BULK_PROOFS)),--bulk-proofs) \
	$(if $(strip $(VM_BULK_KEYS_PER_CALL)),--keys-per-call $(strip $(VM_BULK_KEYS_PER_CALL))) \
	$(if $(strip $(VM_BATCH_MAX_BYTES)),--batch-max-bytes $(strip $(VM_BATCH_MAX_BYTES)))

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

# The bulk flags are only passed when the checked-out toolkit revision knows them, so this
# job keeps working (legacy per-request proofs) with a toolkit that predates bulk mode.
run-vm-active-proofs: get-current-period run-vm-all-platforms
	@echo "Running vm_active_proofs.py (requested flags: $(strip $(VM_ACTIVE_PROOFS_FLAGS)))..."
	cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && \
	FLAGS="$(strip $(VM_ACTIVE_PROOFS_FLAGS))" && \
	if [ -n "$$FLAGS" ] && ! uv run scripts/vm_active_proofs.py --help 2>/dev/null | grep -q -- '--bulk-proofs'; then \
		echo "This toolkit revision has no bulk mode: running legacy per-request proofs" && FLAGS=""; \
	fi && \
	echo "vm_active_proofs.py flags: $$FLAGS" && \
	uv run scripts/vm_active_proofs.py \
	temp/all_platforms.json $(CURRENT_EPOCH) $$FLAGS && \
	cd - > /dev/null && \
	echo "vm_active_proofs.py completed successfully"

move-files:
	@echo "Moving files..."
	mkdir -p api/votemarket/$(CURRENT_EPOCH)/
	cp -Rf temp/votemarket-proofs-script/temp/* api/votemarket/$(CURRENT_EPOCH)/
	rm -f api/votemarket/$(CURRENT_EPOCH)/all_platforms.json
	rm -rf temp/votemarket-proofs-script/temp/*
	mv temp/votemarket-proofs-script/cache/* api/votemarket/votes_cache/
	@echo "Files moved successfully"

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/votemarket-proofs-script.mk clean-votemarket-proofs-script
