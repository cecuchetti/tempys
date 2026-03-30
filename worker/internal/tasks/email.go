package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"pkg/utils"

	"github.com/hibiken/asynq"
)

// EmailTaskPayload represents the payload for sending emails
type EmailTaskPayload struct {
	RecipientID    string   `json:"recipient_id"`
	RecipientEmail string   `json:"recipient_email,omitempty"`
	RecipientPhone string   `json:"recipient_phone,omitempty"`
	RecipientName  string   `json:"recipient_name"`
	ShareIDs       []string `json:"share_ids"`
	SenderName     string   `json:"sender_name,omitempty"`
}

// SendEmail sends an email to a recipient
func SendEmail(ctx context.Context, task *asynq.Task) error {
	var payload EmailTaskPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return err
	}

	// Get site URL from config
	baseURL := utils.GetEnvWithDefault("site.url", "http://localhost:3000")

	// Build share links
	var shareLinks []string
	for _, shareID := range payload.ShareIDs {
		shareLinks = append(shareLinks, fmt.Sprintf("%s/r/%s", baseURL, shareID))
	}

	// Build sender name
	senderName := payload.SenderName
	if senderName == "" {
		senderName = "Someone"
	}

	// Mock email log
	log.Printf(`
[EMAIL MOCK] To: %s
Subject: You have new shared content from %s
Body:
Hi %s,

%s has shared content with you:
%s
Click each link to access the content.

---
[EMAIL MOCK END]`, payload.RecipientEmail, senderName, payload.RecipientName, senderName, strings.Join(shareLinks, "\n"))

	return nil
}

// SendSMS sends an SMS mock notification
func SendSMS(ctx context.Context, task *asynq.Task) error {
	var payload EmailTaskPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return err
	}

	// Get site URL from config
	baseURL := utils.GetEnvWithDefault("site.url", "http://localhost:3000")

	// Build first share link (SMS typically short)
	var shareLink string
	if len(payload.ShareIDs) > 0 {
		shareLink = fmt.Sprintf("%s/r/%s", baseURL, payload.ShareIDs[0])
	}

	// Mock SMS log
	log.Printf(`
[SMS MOCK] To: %s
Message: %s, you have new shared content. Check your email or visit: %s
[SMS MOCK END]`, payload.RecipientPhone, payload.RecipientName, shareLink)

	return nil
}

// ProcessEmailTask handles the email task by dispatching to email or SMS
func ProcessEmailTask(ctx context.Context, task *asynq.Task) error {
	var payload EmailTaskPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return err
	}

	// Process email if recipient has email
	if payload.RecipientEmail != "" {
		if err := SendEmail(ctx, task); err != nil {
			return err
		}
	}

	// Process SMS mock if recipient has phone
	if payload.RecipientPhone != "" {
		if err := SendSMS(ctx, task); err != nil {
			return err
		}
	}

	return nil
}

// EnqueueEmailTask adds an email task to the queue
func EnqueueEmailTask(payload EmailTaskPayload) error {
	client := utils.GetQueueClient()
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	_, err = client.Enqueue(asynq.NewTask("email:send", data))
	return err
}
