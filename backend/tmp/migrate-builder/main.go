package main

import (
	"github.com/golang-migrate/migrate/v4/cmd/migrate/cli"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	cli.Main()
}
