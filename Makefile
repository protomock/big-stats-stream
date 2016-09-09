NPM_TOKEN ?= '00000000-0000-0000-0000-000000000000'
CI_BUILD_NUMBER ?= $(USER)-snapshot
VERSION ?= 0.2.$(CI_BUILD_NUMBER)

package:
	# https://docs.npmjs.com/cli/install
	@npm install --only=production

test: package
	# https://docs.npmjs.com/cli/install
	@npm install --only=dev
	# https://docs.npmjs.com/cli/test
	@npm test

publish: test
	@echo "//registry.npmjs.org/:_authToken=$(NPM_TOKEN)" > ~/.npmrc
	@echo "publishing $(VERSION)"
	@git config --global user.email "builds@travis-ci.com"
	@git config --global user.email "Travis CI"
	# https://docs.npmjs.com/cli/version
	@npm version -m "Version %s built by Travis CI - https://travis-ci.com/$(TRAVIS_REPO_SLUG)/builds/$(TRAVIS_JOB_ID)" $(VERSION)
	# https://docs.npmjs.com/cli/publish
	@npm publish

__version:
	@echo $(VERSION)
