package controllers

import (
	"backend/internal/utils"
	"pkg/models"

	"github.com/labstack/echo/v4"
)

// RecipientPageInfo represents the public landing page data
type RecipientPageInfo struct {
	ShareID     string `json:"share_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// GetRecipientPage returns share info for the public landing page
func GetRecipientPage(c echo.Context) error {
	shareID := c.Param("shareId")
	if shareID == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	shareInfo, err := models.GetRedisShareInfo(shareID)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	if shareInfo == nil || shareInfo.ViewNum < 1 {
		return utils.HTTPErrorHandler(c, ErrShareNotFound)
	}

	// Return page info with share details
	return utils.HTTPSuccessHandler(c, map[string]any{
		"share_id":    shareID,
		"title":       shareInfo.FileName,
		"description": "Shared content",
	})
}

// CreateRecipientProps represents the request body for creating a recipient
type CreateRecipientProps struct {
	ShareID string `json:"share_id"`
	Name    string `json:"name"`
	Email   string `json:"email,omitempty"`
	Phone   string `json:"phone,omitempty"`
}

// CreateRecipient handles public recipient submission
func CreateRecipient(c echo.Context) error {
	r := new(CreateRecipientProps)
	if err := c.Bind(r); err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	// Validate required fields
	if r.ShareID == "" || r.Name == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}
	if r.Email == "" && r.Phone == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Verify share exists
	shareInfo, err := models.GetRedisShareInfo(r.ShareID)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	if shareInfo == nil {
		return utils.HTTPErrorHandler(c, ErrShareNotFound)
	}

	// Check if email/phone already exists for this share
	if r.Email != "" {
		existing, err := models.GetRecipientByContact(r.Email)
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		if existing != nil && existing.ShareID == r.ShareID {
			// Return existing recipient
			return utils.HTTPSuccessHandler(c, map[string]any{
				"id":         existing.ID,
				"user_id":    existing.UserID,
				"share_id":   existing.ShareID,
				"name":       existing.Name,
				"email":      existing.Email,
				"phone":      existing.Phone,
				"created_at": existing.CreatedAt,
			})
		}
	}
	if r.Phone != "" {
		existing, err := models.GetRecipientByContact(r.Phone)
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		if existing != nil && existing.ShareID == r.ShareID {
			// Return existing recipient
			return utils.HTTPSuccessHandler(c, map[string]any{
				"id":         existing.ID,
				"user_id":    existing.UserID,
				"share_id":   existing.ShareID,
				"name":       existing.Name,
				"email":      existing.Email,
				"phone":      existing.Phone,
				"created_at": existing.CreatedAt,
			})
		}
	}

	// Create recipient using params struct
	params := &models.RecipientCreateParams{
		UserID:  shareInfo.Owner,
		ShareID: r.ShareID,
		Name:    r.Name,
		Email:   r.Email,
		Phone:   r.Phone,
	}

	recipient, err := params.Create()
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	// Auto-add to "All Recipients" group
	group, err := models.GetOrCreateAllRecipientsGroup(shareInfo.Owner, r.ShareID)
	if err == nil && group != nil {
		models.AddRecipientToGroup(group.ID, recipient.ID)
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"id":         recipient.ID,
		"user_id":    recipient.UserID,
		"share_id":   recipient.ShareID,
		"name":       recipient.Name,
		"email":      recipient.Email,
		"phone":      recipient.Phone,
		"created_at": recipient.CreatedAt,
	})
}

// ListRecipientsProps represents query parameters for listing recipients
type ListRecipientsProps struct {
	ShareID string `query:"shareId"`
	UserID  string `query:"userId"`
}

// ListRecipients returns recipients for authenticated users
func ListRecipients(c echo.Context) error {
	shareID := c.QueryParam("shareId")

	var recipients []*models.Recipient
	var err error

	if shareID != "" {
		// Get recipients for specific share
		recipients, err = models.GetRecipientsByShareID(shareID)
	} else {
		// For demo: get ALL recipients (in production, filter by user)
		recipients, err = models.GetAllRecipients()
	}

	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"recipients": recipients,
		"total":      len(recipients),
	})
}

// DeleteRecipient deletes a recipient
func DeleteRecipient(c echo.Context) error {
	authVal := c.Get("auth")
	currentUserID, ok := authVal.(string)
	if !ok || currentUserID == "" {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	recipientID := c.Param("id")
	if recipientID == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Get recipient to verify ownership
	recipient, err := models.GetRecipientByID(recipientID)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	if recipient == nil {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Verify ownership
	if recipient.UserID != currentUserID {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	// Remove from any groups
	groups, err := models.GetGroupsByUserID(currentUserID)
	if err == nil {
		for _, g := range groups {
			for _, rid := range g.RecipientIDs {
				if rid == recipientID {
					models.RemoveRecipientFromGroup(g.ID, recipientID)
					break
				}
			}
		}
	}

	// Delete recipient with ownership verification
	if err := models.DeleteRecipient(recipientID, currentUserID); err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"deleted": true,
	})
}
