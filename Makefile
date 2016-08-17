NPM_TOKEN ?= '00000000-0000-0000-0000-000000000000'
CI_BUILD_NUMBER ?= $(USER)-snapshot
VERSION ?= 0.1.$(CI_BUILD_NUMBER)

package:
	# https://docs.npmjs.com/cli/install
	@npm install --only=production

test: package
	# https://docs.npmjs.com/cli/install
	@npm install --only=dev
	# https://docs.npmjs.com/cli/test
	@npm test

publish: test
	echo "//registry.npmjs.org/:_authToken=$(NPM_TOKEN)" > ~/.npmrc
	# https://docs.npmjs.com/cli/version
	@npm version $(VERSION)
	# https://docs.npmjs.com/cli/publish
	@npm publish

__version:
	@echo $(VERSION)
