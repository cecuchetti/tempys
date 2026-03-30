package main

import (
	"fmt"
	"pkg/utils"

	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

func main() {
	// 日志
	var logger *zap.Logger
	if utils.GetEnvWithDefault("node.env", "production") == "production" {
		logger, _ = zap.NewProduction()
	} else {
		logger, _ = zap.NewDevelopment()
	}
	defer logger.Sync() //nolint:errcheck
	zap.ReplaceGlobals(logger)

	e := echo.New()

	// Register public routes first (no auth middleware)
	for _, route := range publicRoutes {
		e.Match(route.Method, route.Path, route.Handler)
	}

	// Apply middleware for authenticated routes
	for _, middleware := range middlewares {
		e.Use(middleware())
	}

	// Register authenticated routes
	for _, route := range routes {
		e.Match(route.Method, route.Path, route.Handler)
	}
	if err := e.Start(fmt.Sprintf(":%s", utils.GetEnvWithDefault("api.port", "5001"))); err != nil {
		logger.Fatal("server failed", zap.Error(err))
	}
}
