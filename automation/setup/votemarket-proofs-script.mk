# Votemarket proof toolkit (repository formerly named votemarket-proofs-script)
VOTEMARKET_PROOFS_SCRIPT_REPO := stake-dao/votemarket-proof-toolkit
VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR := temp/votemarket-proofs-script
# The job always runs the toolkit's main branch (override locally only, to test a toolkit branch).
VOTEMARKET_PROOFS_SCRIPT_BRANCH ?= main

.PHONY: checkout-votemarket-proofs-script install-votemarket-proofs-script-deps clean-votemarket-proofs-script
checkout-votemarket-proofs-script:
	@echo "Checking out $(VOTEMARKET_PROOFS_SCRIPT_REPO) @ $(VOTEMARKET_PROOFS_SCRIPT_BRANCH)..."
	@mkdir -p temp
	@if [ -d "$(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)/.git" ]; then \
		cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && \
		git fetch --quiet origin $(VOTEMARKET_PROOFS_SCRIPT_BRANCH) && \
		git checkout --quiet -B $(VOTEMARKET_PROOFS_SCRIPT_BRANCH) FETCH_HEAD; \
	else \
		if [ -n "$(GIT_ACCESS_TOKEN)" ]; then \
			echo "Cloning over HTTPS with GIT_ACCESS_TOKEN" && \
			git clone --quiet -b $(VOTEMARKET_PROOFS_SCRIPT_BRANCH) https://oauth2:$(GIT_ACCESS_TOKEN)@github.com/$(VOTEMARKET_PROOFS_SCRIPT_REPO).git $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR); \
		else \
			echo "Cloning over SSH" && \
			git clone --quiet -b $(VOTEMARKET_PROOFS_SCRIPT_BRANCH) git@github.com:$(VOTEMARKET_PROOFS_SCRIPT_REPO).git $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR); \
		fi \
	fi
	@cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && echo "Toolkit at $$(git rev-parse --short HEAD) ($(VOTEMARKET_PROOFS_SCRIPT_BRANCH))"

# Resolve and install the toolkit environment now, so a dependency problem fails here
# with a clear message instead of inside the proof generation.
install-votemarket-proofs-script-deps: checkout-votemarket-proofs-script
	@echo "Installing toolkit dependencies..."
	@cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && uv sync

clean-votemarket-proofs-script:
	@echo "Cleaning up votemarket-proofs-script..."
	rm -rf $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)
