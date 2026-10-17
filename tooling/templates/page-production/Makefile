.DEFAULT_GOAL := help
.PHONY: install validate build package test clean help

install:
	npm install --ignore-scripts --audit=false --fund=false

validate:
	npm run validate

build:
	npm run build

package:
	npm run package

test:
	npm test

clean:
	rm -rf dist

help:
	@echo "Cedros custom-page authoring commands:"
	@echo "  make validate  Validate metadata, all surfaces, imports, and fallback content"
	@echo "  make build     Run the standalone authoring gate"
	@echo "  make package   Write dist/__CEDROS_PAGE_ID__.cedros-page.zip"
	@echo "  make test      Run validation regression tests"
