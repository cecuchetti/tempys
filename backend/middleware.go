package main

import (
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

var middlewares = []func() echo.MiddlewareFunc{
	middleware.SessionMiddleware,
	middleware.AuthMiddleware,
	middleware.RateLimiterMiddleware,
	middleware.LoggerMiddleware,
}
