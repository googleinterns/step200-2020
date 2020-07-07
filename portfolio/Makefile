all: mvnpkg

run: yarnpkg
	mvn package appengine:run

deploy: yarnpkg
	mvn package appengine:deploy


mvnpkg: yarnpkg
	mvn package

yarnpkg:
	cd webapp; yarn build
	cp -r webapp/build/* src/main/webapp

clean:
	-rm -r src/main/webapp/build src/main/webapp/static src/main/webapp/node_modules
	-rm -r target


.PHONY: all run deploy mvnpkg yarnpkg clean
