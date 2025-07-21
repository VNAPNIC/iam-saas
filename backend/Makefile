.PHONY: server migrateup migratedown

# Go configuration
BINARY_NAME=iam-server
BINARY_PATH=./tmp/${BINARY_NAME}

# Database configuration
DB_URL=postgres://postgres:postgres@localhost:5432/iam_saas_db?sslmode=disable

server:
	@go build -o ${BINARY_PATH} ./cmd/server
	@./${BINARY_PATH}

migrateup:
	@echo "Running migrations up..."
	migrate -path ./migrations -database "${DB_URL}" -verbose up

migratedown:
	@echo "Running migrations down..."
	migrate -path ./migrations -database "${DB_URL}" -verbose down