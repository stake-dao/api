# Votemarket-proofs-script configuration
VOTEMARKET_PROOFS_SCRIPT_REPO := stake-dao/votemarket-proofs-script
VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR := temp/votemarket-proofs-script
VOTEMARKET_PROOFS_SCRIPT_BRANCH ?= main

.PHONY: checkout-votemarket-proofs-script install-votemarket-proofs-script-deps
checkout-votemarket-proofs-script:
	@echo "Checking out votemarket-proofs-script repository..."
	@mkdir -p temp
	@rm -rf $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)
	@git clone -b $(VOTEMARKET_PROOFS_SCRIPT_BRANCH) https://$(GIT_ACCESS_TOKEN)@github.com/$(VOTEMARKET_PROOFS_SCRIPT_REPO).git $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)

install-votemarket-proofs-script-deps:
	@echo "Installing dependencies for votemarket-proofs-script..."
	$(PIP) install -r $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)/requirements.txt

clean-votemarket-proofs-script:
	@echo "Cleaning up votemarket-proofs-script..."
	rm -rf $(VOTEMARKET_PROOFS_SCRIPT_DEVOPS_DIR)