.PHONY: build clean deploy gomodgen

build: gomodgen
	export GO111MODULE=on
	GOOS=linux GOARCH=amd64 go build -o bootstrap -tags lambda.norpc main.go
	zip function.zip bootstrap
clean:
	rm -rf ./bin ./vendor go.sum
 
