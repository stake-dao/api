# Check if .env file exists and load it
ENV_FILE := $(wildcard .env)
ifneq ($(ENV_FILE),)
    # Load environment variables
    include .env
    # Export them
    export $(shell sed 's/=.*//' .env)
else
    $(warning No .env file found, environment variables may be missing)
endif