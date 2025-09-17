# Votemarket-proofs-script configuration
VOTEMARKET_PROOFS_SCRIPT_REPO := stake-dao/votemarket-proofs-script
VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR := temp/votemarket-proofs-script
VOTEMARKET_PROOFS_SCRIPT_BRANCH ?= main

.PHONY: checkout-votemarket-proofs-script install-votemarket-proofs-script-deps clean-votemarket-proofs-script
checkout-votemarket-proofs-script:
	@echo "Checking out votemarket-proofs-script repository..."
	@mkdir -p temp
	@if [ -d "$(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)" ]; then \
		cd $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR) && git pull origin $(VOTEMARKET_PROOFS_SCRIPT_BRANCH); \
	else \
		echo "Using GIT_ACCESS_TOKEN: $(GIT_ACCESS_TOKEN)" && \
		if [ -n "$(GIT_ACCESS_TOKEN)" ]; then \
			git clone -b $(VOTEMARKET_PROOFS_SCRIPT_BRANCH) https://oauth2:$(GIT_ACCESS_TOKEN)@github.com/$(VOTEMARKET_PROOFS_SCRIPT_REPO).git $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR); \
		else \
			git clone -b $(VOTEMARKET_PROOFS_SCRIPT_BRANCH) git@github.com:$(VOTEMARKET_PROOFS_SCRIPT_REPO).git $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR); \
		fi \
	fi

clean-votemarket-proofs-script:
	@echo "Cleaning up votemarket-proofs-script..."
	rm -rf $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)