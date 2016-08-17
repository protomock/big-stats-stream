PROJECT_ID ?= meetup-prod
DATASET_ID ?= big_stats
TABLE_ID ?= test
GOOGLE_API_CREDENTIALS ?= '$(shell cat google-auth-credentials.json)'

package:
	@npm install --only=production

test: package
	@npm install --only=dev
	@npm test

publish: test
	# @npm login ?
	# @npm publish
