NPM_TOKEN ?= '00000000-0000-0000-0000-000000000000'

package:
	@npm install --only=production

test: package
	@npm install --only=dev
	@npm test

publish: test
	echo "//registry.npmjs.org/:_authToken=$(NPM_TOKEN)" > ~/.npmrc
	# @npm login ?
	# @npm publish
