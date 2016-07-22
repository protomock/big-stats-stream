PROJECT_ID ?= meetup-prod
DATASET_ID ?= big_stats
TABLE_ID ?= test
GOOGLE_API_CREDENTIALS ?= '$(shell cat google-auth-credentials.json)'

package:
	@npm install

test: package
	GOOGLE_API_CREDENTIALS=$(GOOGLE_API_CREDENTIALS) \
	PROJECT_ID=$(PROJECT_ID) \
	DATASET_ID=$(DATASET_ID) \
	TABLE_ID=$(TABLE_ID) \
	node -e 'require(".").run()'
