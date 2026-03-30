package controllers

import (
	"backend/internal/utils"
	"pkg/models"

	"github.com/labstack/echo/v4"
)

// CreateGroupProps represents the request body for creating a group
type CreateGroupProps struct {
	Name         string   `json:"name"`
	RecipientIDs []string `json:"recipient_ids,omitempty"`
}

// CreateGroup creates a new group
func CreateGroup(c echo.Context) error {
	authVal := c.Get("auth")
	userID, ok := authVal.(string)
	if !ok || userID == "" {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	r := new(CreateGroupProps)
	if err := c.Bind(r); err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	// Validate name
	if r.Name == "" || r.Name == "All Recipients" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Check for duplicate name for this user
	existingGroups, err := models.GetGroupsByUserID(userID)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	for _, g := range existingGroups {
		if g.Name == r.Name {
			return utils.HTTPErrorHandler(c, ErrInvalidRequest)
		}
	}

	// Create group using params struct
	params := &models.GroupCreateParams{
		UserID:       userID,
		Name:         r.Name,
		RecipientIDs: r.RecipientIDs,
		IsAuto:       false,
	}

	group, err := params.Create()
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"id":            group.ID,
		"user_id":       group.UserID,
		"name":          group.Name,
		"recipient_ids": group.RecipientIDs,
		"is_auto":       group.IsAuto,
		"created_at":    group.CreatedAt,
	})
}

// ListGroups returns all groups for the current user
func ListGroups(c echo.Context) error {
	authVal := c.Get("auth")
	userID, ok := authVal.(string)
	if !ok || userID == "" {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	groups, err := models.GetGroupsByUserID(userID)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	// Convert to response format
	var responseGroups []map[string]any
	for _, g := range groups {
		responseGroups = append(responseGroups, map[string]any{
			"id":            g.ID,
			"user_id":       g.UserID,
			"name":          g.Name,
			"recipient_ids": g.RecipientIDs,
			"is_auto":       g.IsAuto,
			"share_id":      g.ShareID,
			"created_at":    g.CreatedAt,
			"updated_at":    g.UpdatedAt,
		})
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"groups": responseGroups,
		"total":  len(responseGroups),
	})
}

// UpdateGroupProps represents the request body for updating a group
type UpdateGroupProps struct {
	Name         string   `json:"name,omitempty"`
	RecipientIDs []string `json:"recipient_ids,omitempty"`
}

// UpdateGroup updates an existing group
func UpdateGroup(c echo.Context) error {
	authVal := c.Get("auth")
	userID, ok := authVal.(string)
	if !ok || userID == "" {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	groupID := c.Param("id")
	if groupID == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	r := new(UpdateGroupProps)
	if err := c.Bind(r); err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	// Get existing group
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

	// Prevent updating auto "All Recipients" group name
	if group.IsAuto && group.Name == "All Recipients" && r.Name != "" && r.Name != "All Recipients" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Update fields
	if r.Name != "" {
		// Check for duplicate name
		existingGroups, err := models.GetGroupsByUserID(userID)
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		for _, g := range existingGroups {
			if g.ID != groupID && g.Name == r.Name {
				return utils.HTTPErrorHandler(c, ErrInvalidRequest)
			}
		}
		group.Name = r.Name
	}
	if r.RecipientIDs != nil {
		group.RecipientIDs = r.RecipientIDs
	}

	if err := group.Update(); err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"id":            group.ID,
		"user_id":       group.UserID,
		"name":          group.Name,
		"recipient_ids": group.RecipientIDs,
		"is_auto":       group.IsAuto,
		"created_at":    group.CreatedAt,
		"updated_at":    group.UpdatedAt,
	})
}

// DeleteGroup deletes a group
func DeleteGroup(c echo.Context) error {
	authVal := c.Get("auth")
	userID, ok := authVal.(string)
	if !ok || userID == "" {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	groupID := c.Param("id")
	if groupID == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Get existing group to check ownership
	group, err := models.GetGroupByID(groupID)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	if group == nil {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	// Delete group (will fail if trying to delete auto "All Recipients" group)
	if err := models.DeleteGroup(groupID, userID); err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"deleted": true,
	})
}
