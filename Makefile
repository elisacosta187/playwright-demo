COMMAND := docker-compose run --rm playwright-demo

docker-install: 
	${COMMAND} yarn install

docker-test: docker-install
	${COMMAND} yarn test

sh: docker-install
	${COMMAND} bash

docker-test-snapshots: docker-install
	${COMMAND} yarn test-snapshots

docker-update-snapshots: docker-install
	${COMMAND}  yarn update-snapshots

clean:
	rm -rf test-results playwright-report