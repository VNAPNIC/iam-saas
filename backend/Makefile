.PHONY: server migrateup migratedown

# Go configuration
BINARY_NAME=iam-server
BINARY_PATH=./tmp/${BINARY_NAME}

# Database configuration
DB_URL=postgres://postgres:postgres@localhost:5432/iam_saas?sslmode=disable

server:
	@go build -o ${BINARY_PATH} ./cmd/server
	@./${BINARY_PATH}

lint:
	golangci-lint run --fix

migrateup:
	@echo "Running migrations up..."
	migrate -path ./migrations -database "${DB_URL}" -verbose up

migratedown:
	@echo "Running migrations down..."
	migrate -path ./migrations -database "${DB_URL}" -verbose down

generate_key:
	node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"