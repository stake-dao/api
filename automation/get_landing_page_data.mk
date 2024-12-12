# Makefile for vm_all_platforms

include automation/setup/python.mk
include automation/setup/dotenv.mk
include automation/setup/automation-jobs.mk

# Ensure all env are set
ifndef GIT_ACCESS_TOKEN
ifndef ETHEREUM_MAINNET_RPC_URL
$(error Some environment variables are not set. Please set them in the environment)
endif
endif

# Job-specific targets
.PHONY: all setup install-deps run-get-landing-page-data move-files clean

# Define the default target
.DEFAULT_GOAL := all

all: setup install-deps run-get-landing-page-data move-files

setup: setup-python checkout-automation

install-deps: install-automation-deps

run-get-landing-page-data:
	@echo "Running landing_page.py..."
	cd $(AUTOMATION_DEVOPS_DIR) && \
	PYTHONPATH=script \
	uv run script/votemarket/v2/landing_page.py \
	cd - > /dev/null && \
	echo "landing_page.py completed successfully"

move-files:
	@echo "Moving files..."
	mkdir -p api/votemarket/landing_page_data/
	mv temp/automation-jobs/temp/*votemarket_stats.json api/votemarket/

.PHONY: clean
clean:
	@echo "Cleaning up local files..."
	rm -rf temp/
	$(MAKE) -f automation/setup/python.mk clean-python
	$(MAKE) -f automation/setup/automation-jobs.mk clean-automation