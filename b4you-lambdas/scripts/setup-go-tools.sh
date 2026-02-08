#!/bin/bash

# Check if golangci-lint is installed
if ! command -v golangci-lint &> /dev/null; then
    echo "Installing golangci-lint..."
    curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.54.2
fi

# Check if gofmt is available
if ! command -v gofmt &> /dev/null; then
    echo "Error: gofmt not found. Please install Go properly."
    exit 1
fi

echo "Go tools are ready!" 