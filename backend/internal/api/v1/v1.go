package v1

import (
	"github.com/gin-gonic/gin"
)

type API_V1 struct {
	router *gin.Engine
}

func NewApiV1(router *gin.Engine) *API_V1 {
	return &API_V1{
		router: router,
	}
}
