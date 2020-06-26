all: mvnpkg

mvnpkg: yarnpkg
	mvn package

yarnpkg:
	cd webapp; yarnpkg build
	cp -r webapp/build/* src/main/webapp

clean:
	git clean -X

.PHONY: all mvnpkg yarnpkg clean
