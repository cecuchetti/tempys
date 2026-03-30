package models

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"
	"unicode/utf8"

	"pkg/utils"

	gonanoid "github.com/matoous/go-nanoid/v2"
	"github.com/redis/go-redis/v9"
)

// Group represents a recipient group
type Group struct {
	ID           string   `json:"id"`
	UserID       string   `json:"user_id"`
	Name         string   `json:"name"`
	RecipientIDs []string `json:"recipient_ids"`
	IsAuto       bool     `json:"is_auto"`  // Whether this is an auto-created group
	ShareID      string   `json:"share_id"` // Associated share ID for auto-groups
	CreatedAt    int64    `json:"created_at"`
	UpdatedAt    int64    `json:"updated_at"`
}

// GroupCreateParams holds parameters for creating a group
type GroupCreateParams struct {
	UserID       string
	Name         string
	RecipientIDs []string
	IsAuto       bool
	ShareID      string
}

// Validate validates the group parameters
func (p *GroupCreateParams) Validate() error {
	if strings.TrimSpace(p.Name) == "" {
		return fmt.Errorf("name is required")
	}
	if utf8.RuneCountInString(p.Name) > 100 {
		return fmt.Errorf("name must be 100 characters or less")
	}
	if p.UserID == "" {
		return fmt.Errorf("user_id is required")
	}
	if len(p.RecipientIDs) > 500 {
		return fmt.Errorf("maximum 500 recipients per group")
	}
	// Auto-groups have special naming rules
	if p.IsAuto && p.Name != "All Recipients" {
		return fmt.Errorf("auto groups must be named 'All Recipients'")
	}
	return nil
}

// Create creates a new group in Redis
func (p *GroupCreateParams) Create() (*Group, error) {
	rdb, ctx := utils.GetRedisClient()

	// Validate
	if err := p.Validate(); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	// Generate ID
	id := generateID()

	now := time.Now().Unix()
	group := &Group{
		ID:           id,
		UserID:       p.UserID,
		Name:         strings.TrimSpace(p.Name),
		RecipientIDs: p.RecipientIDs,
		IsAuto:       p.IsAuto,
		ShareID:      p.ShareID,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	// Marshal group data
	data, err := json.Marshal(group)
	if err != nil {
		return nil, err
	}

	// Use pipeline for atomic operations
	pipe := rdb.Pipeline()

	// Store group
	key := fmt.Sprintf("015:group:%s", id)
	pipe.Set(ctx, key, string(data), 0)

	// Add to user groups set
	userKey := fmt.Sprintf("015:userGroups:%s", p.UserID)
	pipe.SAdd(ctx, userKey, id)

	// For auto groups, set the lookup key
	if p.IsAuto && p.ShareID != "" {
		autoKey := fmt.Sprintf("015:autoGroups:%s:%s", p.UserID, p.ShareID)
		pipe.Set(ctx, autoKey, id, 0)
	}

	_, err = pipe.Exec(ctx)
	if err != nil {
		return nil, err
	}

	return group, nil
}

// GetGroupByID retrieves a group by ID
func GetGroupByID(id string) (*Group, error) {
	rdb, ctx := utils.GetRedisClient()

	key := fmt.Sprintf("015:group:%s", id)
	data, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var group Group
	if err := json.Unmarshal([]byte(data), &group); err != nil {
		return nil, err
	}

	return &group, nil
}

// GetGroupsByUserID retrieves all groups for a user using pipeline
func GetGroupsByUserID(userID string) ([]*Group, error) {
	rdb, ctx := utils.GetRedisClient()

	userKey := fmt.Sprintf("015:userGroups:%s", userID)
	groupIDs, err := rdb.SMembers(ctx, userKey).Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}

	return batchGetGroups(ctx, rdb, groupIDs)
}

// batchGetGroups fetches multiple groups using pipeline
func batchGetGroups(ctx context.Context, rdb *redis.Client, ids []string) ([]*Group, error) {
	if len(ids) == 0 {
		return []*Group{}, nil
	}

	pipe := rdb.Pipeline()
	cmds := make([]*redis.StringCmd, len(ids))

	for i, id := range ids {
		key := fmt.Sprintf("015:group:%s", id)
		cmds[i] = pipe.Get(ctx, key)
	}

	_, err := pipe.Exec(ctx)
	if err != nil && err != redis.Nil {
		return nil, err
	}

	groups := make([]*Group, 0, len(ids))
	for _, cmd := range cmds {
		data, err := cmd.Result()
		if err == redis.Nil {
			continue
		}
		if err != nil {
			continue
		}

		var group Group
		if err := json.Unmarshal([]byte(data), &group); err != nil {
			continue
		}
		groups = append(groups, &group)
	}

	return groups, nil
}

// CountGroupsByUserID returns the count of groups for a user
func CountGroupsByUserID(userID string) (int64, error) {
	rdb, ctx := utils.GetRedisClient()
	userKey := fmt.Sprintf("015:userGroups:%s", userID)
	return rdb.SCard(ctx, userKey).Result()
}

// Update updates an existing group
func (g *Group) Update() error {
	rdb, ctx := utils.GetRedisClient()

	g.UpdatedAt = time.Now().Unix()

	// Marshal group data
	data, err := json.Marshal(g)
	if err != nil {
		return err
	}

	// Update group
	key := fmt.Sprintf("015:group:%s", g.ID)
	err = rdb.Set(ctx, key, string(data), 0).Err()
	if err != nil {
		return err
	}

	return nil
}

// Delete removes a group from Redis with ownership verification
func DeleteGroup(id string, userID string) error {
	rdb, ctx := utils.GetRedisClient()

	// Get group first to verify ownership and get details
	group, err := GetGroupByID(id)
	if err != nil {
		return err
	}
	if group == nil {
		return nil // Already deleted
	}

	// Verify ownership
	if group.UserID != userID {
		return fmt.Errorf("unauthorized: group does not belong to user")
	}

	// Prevent deleting auto "All Recipients" group
	if group.IsAuto && group.Name == "All Recipients" {
		return fmt.Errorf("cannot delete the All Recipients group")
	}

	// Use pipeline for atomic deletion
	pipe := rdb.Pipeline()

	// Delete group
	key := fmt.Sprintf("015:group:%s", id)
	pipe.Del(ctx, key)

	// Remove from user groups set
	userKey := fmt.Sprintf("015:userGroups:%s", userID)
	pipe.SRem(ctx, userKey, id)

	// For auto groups, remove the lookup key
	if group.IsAuto && group.ShareID != "" {
		autoKey := fmt.Sprintf("015:autoGroups:%s:%s", userID, group.ShareID)
		pipe.Del(ctx, autoKey)
	}

	_, err = pipe.Exec(ctx)
	return err
}

// GetOrCreateAllRecipientsGroup gets or creates the "All Recipients" group for a share
func GetOrCreateAllRecipientsGroup(userID string, shareID string) (*Group, error) {
	// First try the fast path with the auto group key
	autoGroup, err := GetAutoGroupByShare(userID, shareID)
	if err != nil {
		return nil, err
	}
	if autoGroup != nil {
		return autoGroup, nil
	}

	// Need to create it
	// Try to create the group
	params := &GroupCreateParams{
		UserID:  userID,
		Name:    "All Recipients",
		IsAuto:  true,
		ShareID: shareID,
	}

	group, err := params.Create()
	if err != nil {
		// Check if it was created by another request
		if strings.Contains(err.Error(), "validation error") == false {
			autoGroup, err := GetAutoGroupByShare(userID, shareID)
			if err != nil {
				return nil, err
			}
			if autoGroup != nil {
				return autoGroup, nil
			}
		}
		return nil, err
	}

	return group, nil
}

// GetAutoGroupByShare gets the auto "All Recipients" group for a share
func GetAutoGroupByShare(userID string, shareID string) (*Group, error) {
	rdb, ctx := utils.GetRedisClient()

	autoKey := fmt.Sprintf("015:autoGroups:%s:%s", userID, shareID)
	groupID, err := rdb.Get(ctx, autoKey).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return GetGroupByID(groupID)
}

// AddRecipientToGroup adds a recipient to a group
func AddRecipientToGroup(groupID string, recipientID string) error {
	group, err := GetGroupByID(groupID)
	if err != nil {
		return err
	}
	if group == nil {
		return fmt.Errorf("group not found")
	}

	// Check limit
	if len(group.RecipientIDs) >= 500 {
		return fmt.Errorf("maximum 500 recipients per group")
	}

	// Check if already in group
	for _, id := range group.RecipientIDs {
		if id == recipientID {
			return nil // Already in group
		}
	}

	group.RecipientIDs = append(group.RecipientIDs, recipientID)
	return group.Update()
}

// RemoveRecipientFromGroup removes a recipient from a group
func RemoveRecipientFromGroup(groupID string, recipientID string) error {
	group, err := GetGroupByID(groupID)
	if err != nil {
		return err
	}
	if group == nil {
		return nil
	}

	// Remove from slice
	newIDs := make([]string, 0, len(group.RecipientIDs))
	for _, id := range group.RecipientIDs {
		if id != recipientID {
			newIDs = append(newIDs, id)
		}
	}
	group.RecipientIDs = newIDs

	return group.Update()
}

// AddRecipientsToGroupBatch adds multiple recipients to a group efficiently
func AddRecipientsToGroupBatch(groupID string, recipientIDs []string) error {
	group, err := GetGroupByID(groupID)
	if err != nil {
		return err
	}
	if group == nil {
		return fmt.Errorf("group not found")
	}

	// Check limit
	if len(group.RecipientIDs)+len(recipientIDs) > 500 {
		return fmt.Errorf("would exceed maximum 500 recipients per group")
	}

	// Build a set of existing IDs
	existing := make(map[string]bool)
	for _, id := range group.RecipientIDs {
		existing[id] = true
	}

	// Add only new IDs
	for _, id := range recipientIDs {
		if !existing[id] {
			group.RecipientIDs = append(group.RecipientIDs, id)
			existing[id] = true
		}
	}

	return group.Update()
}

// SetGroupRecipients replaces all recipients in a group
func SetGroupRecipients(groupID string, recipientIDs []string, userID string) error {
	group, err := GetGroupByID(groupID)
	if err != nil {
		return err
	}
	if group == nil {
		return fmt.Errorf("group not found")
	}

	// Verify ownership
	if group.UserID != userID {
		return fmt.Errorf("unauthorized: group does not belong to user")
	}

	// Check limit
	if len(recipientIDs) > 500 {
		return fmt.Errorf("maximum 500 recipients per group")
	}

	group.RecipientIDs = recipientIDs
	return group.Update()
}

// GetGroupRecipientCount returns the number of recipients in a group
func GetGroupRecipientCount(groupID string) (int, error) {
	group, err := GetGroupByID(groupID)
	if err != nil {
		return 0, err
	}
	if group == nil {
		return 0, fmt.Errorf("group not found")
	}
	return len(group.RecipientIDs), nil
}

// GetGroupsByShareID retrieves all groups for a specific share (useful for listing)
func GetGroupsByShareID(userID string, shareID string) ([]*Group, error) {
	groups, err := GetGroupsByUserID(userID)
	if err != nil {
		return nil, err
	}

	var shareGroups []*Group
	for _, g := range groups {
		if g.ShareID == shareID {
			shareGroups = append(shareGroups, g)
		}
	}

	return shareGroups, nil
}

// generateID generates a unique ID for a group
func generateID() string {
	id, _ := gonanoid.New(12)
	return id
}
