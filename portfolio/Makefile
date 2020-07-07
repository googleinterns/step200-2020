all: mvnpkg

run: yarnpkg
	mvn package appengine:run

deploy: yarnpkg
	mvn package appengine:deploy


mvnpkg: yarnpkg
	mvn package

yarnpkg:
	cd webapp; yarnpkg build
	cp -r webapp/build/* src/main/webapp

clean:
	git clean -f -X

.PHONY: all run deploy mvnpkg yarnpkg clean
