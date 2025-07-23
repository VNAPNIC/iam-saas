package main

import (
	"fmt"
	"iam-saas/pkg/utils"
)

func main() {
	var password = "hainam1421"
	hash, _ := utils.HashPassword(password)

	fmt.Println("Password:", password)
	fmt.Println("Hash:    ", hash)
	match := utils.CheckPasswordHash(password, hash)
	fmt.Println("Match:   ", match)
}
