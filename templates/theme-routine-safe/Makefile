.PHONY: install validate build review package test clean help

install:
	node ./scripts/install-theme-runtime.mjs "$(THEME_RUNTIME_TARBALL)"
	npm ci --ignore-scripts --omit=peer --audit=false --fund=false

validate:
	npm run validate

build:
	npm run build

review:
	npm run review

package:
	npm run package

test:
	npm test

clean:
	rm -rf dist .theme-review node_modules

help:
	@echo "Cedros theme authoring commands:"
	@echo "  make install  - Install pinned npm dependencies"
	@echo "  make validate - Validate the routine-safe portable theme package"
	@echo "  make build    - Validate and render .theme-review/index.html"
	@echo "  make package  - Write dist/<theme-id>-<version>/manifest.json and .zip"
	@echo "  make test     - Run scaffold tests"
	@echo "  make clean    - Remove generated artifacts"
