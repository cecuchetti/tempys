package main

import (
	"backend/internal/controllers"

	"github.com/labstack/echo/v4"
)

type Route struct {
	Method  []string
	Path    string
	Handler func(c echo.Context) error
}

// Public routes - no auth required
var publicRoutes = []Route{
	// Recipient public endpoints
	{Method: []string{"GET"}, Path: "/recipient/page/:shareId", Handler: controllers.GetRecipientPage},
	{Method: []string{"POST"}, Path: "/recipient", Handler: controllers.CreateRecipient},
}

var routes = []Route{
	{Method: []string{"POST"}, Path: "/file/create", Handler: controllers.CreateUploadTask},
	{Method: []string{"POST"}, Path: "/file/slice", Handler: controllers.UploadFileSlice},
	{Method: []string{"POST"}, Path: "/file/finish", Handler: controllers.FinishUploadTask},

	{Method: []string{"GET"}, Path: "/share/:id", Handler: controllers.GetShareInfo},
	{Method: []string{"POST"}, Path: "/share", Handler: controllers.CreateShareInfo},

	{Method: []string{"GET"}, Path: "/download", Handler: controllers.DownloadShare},
	{Method: []string{"POST"}, Path: "/download", Handler: controllers.VaildateShare},
	{Method: []string{"GET"}, Path: "/share/pickup/:code", Handler: controllers.GetShareByPickupCode},

	{Method: []string{"GET"}, Path: "/stat", Handler: controllers.GetStat},
	{Method: []string{"GET"}, Path: "/config", Handler: controllers.GetConfig},
	{Method: []string{"GET"}, Path: "/about", Handler: controllers.GetAbout},

	{Method: []string{"GET"}, Path: "/user/shares", Handler: controllers.GetUserShares},

	{Method: []string{"POST"}, Path: "/task/:type", Handler: controllers.CreateTask},
	{Method: []string{"GET"}, Path: "/task/:id", Handler: controllers.GetTask},

	// Recipient endpoints
	{Method: []string{"GET"}, Path: "/recipient", Handler: controllers.ListRecipients},
	{Method: []string{"DELETE"}, Path: "/recipient/:id", Handler: controllers.DeleteRecipient},

	// Group endpoints
	{Method: []string{"GET"}, Path: "/group", Handler: controllers.ListGroups},
	{Method: []string{"POST"}, Path: "/group", Handler: controllers.CreateGroup},
	{Method: []string{"PUT"}, Path: "/group/:id", Handler: controllers.UpdateGroup},
	{Method: []string{"DELETE"}, Path: "/group/:id", Handler: controllers.DeleteGroup},

	// Send endpoint
	{Method: []string{"POST"}, Path: "/group/:id/send", Handler: controllers.SendToGroup},
}
