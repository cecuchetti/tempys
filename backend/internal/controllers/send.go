package controllers

import (
	"backend/internal/utils"
	"encoding/json"
	"pkg/models"
	u "pkg/utils"

	"github.com/hibiken/asynq"
	"github.com/labstack/echo/v4"
)

// SendGroupProps represents the request body for sending to a group
type SendGroupProps struct {
	ShareIDs []string `json:"share_ids"`
}

// SendToGroup sends share links to all members of a group
func SendToGroup(c echo.Context) error {
	authVal := c.Get("auth")
	userID, ok := authVal.(string)
	if !ok || userID == "" {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	groupID := c.Param("id")
	if groupID == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	r := new(SendGroupProps)
	if err := c.Bind(r); err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	if len(r.ShareIDs) == 0 {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Get group
	group, err := models.GetGroupByID(groupID)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	if group == nil {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Verify ownership
	if group.UserID != userID {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	// Validate all share IDs belong to user
	for _, shareID := range r.ShareIDs {
		shareInfo, err := models.GetRedisShareInfo(shareID)
		if err != nil || shareInfo == nil {
			return utils.HTTPErrorHandler(c, ErrShareNotFound)
		}
		if shareInfo.Owner != userID {
			return utils.HTTPErrorHandler(c, ErrUnauthorized)
		}
	}

	// Get sender name from session or config
	senderName := ""
	// Could be extended to get from user profile

	// Send to each recipient
	sentCount := 0
	var failures []map[string]any

	for _, recipientID := range group.RecipientIDs {
		recipient, err := models.GetRecipientByID(recipientID)
		if err != nil || recipient == nil {
			failures = append(failures, map[string]any{
				"recipient_id": recipientID,
				"error":        "recipient not found",
			})
			continue
		}

		// Create task payload
		payload := map[string]any{
			"recipient_id":   recipient.ID,
			"recipient_name": recipient.Name,
			"share_ids":      r.ShareIDs,
			"sender_name":    senderName,
		}

		// Enqueue task for email
		if recipient.Email != "" {
			payload["recipient_email"] = recipient.Email
			if err := enqueueEmailTask(payload); err != nil {
				failures = append(failures, map[string]any{
					"recipient_id": recipientID,
					"error":        err.Error(),
				})
				continue
			}
			sentCount++
		}

		// Enqueue task for SMS mock
		if recipient.Phone != "" {
			payload["recipient_phone"] = recipient.Phone
			if err := enqueueEmailTask(payload); err != nil {
				failures = append(failures, map[string]any{
					"recipient_id": recipientID,
					"error":        err.Error(),
				})
				continue
			}
			sentCount++
		}

		// If neither email nor phone, it's a failure
		if recipient.Email == "" && recipient.Phone == "" {
			failures = append(failures, map[string]any{
				"recipient_id": recipientID,
				"error":        "no contact information",
			})
		}
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"sent":     sentCount,
		"failures": failures,
	})
}

// enqueueEmailTask creates and enqueues an email task
func enqueueEmailTask(payload map[string]any) error {
	client := u.GetQueueClient()
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	_, err = client.Enqueue(asynq.NewTask("email:send", jsonPayload))
	return err
}
