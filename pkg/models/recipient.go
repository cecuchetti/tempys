package models

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"
	"unicode/utf8"

	"pkg/utils"

	"github.com/redis/go-redis/v9"
)

// Recipient represents a recipient in the system
type Recipient struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`  // Owner user ID (the share owner)
	ShareID   string `json:"share_id"` // Associated share ID
	Name      string `json:"name"`
	Email     string `json:"email,omitempty"`
	Phone     string `json:"phone,omitempty"`
	CreatedAt int64  `json:"created_at"`
}

// RecipientCreateParams holds parameters for creating a recipient
type RecipientCreateParams struct {
	UserID  string
	ShareID string
	Name    string
	Email   string
	Phone   string
}

// Validate validates the recipient parameters
func (p *RecipientCreateParams) Validate() error {
	if strings.TrimSpace(p.Name) == "" {
		return fmt.Errorf("name is required")
	}
	if utf8.RuneCountInString(p.Name) > 100 {
		return fmt.Errorf("name must be 100 characters or less")
	}
	if p.Email != "" && !isValidEmail(p.Email) {
		return fmt.Errorf("invalid email format")
	}
	if p.Phone != "" && !isValidPhone(p.Phone) {
		return fmt.Errorf("invalid phone format")
	}
	if p.ShareID == "" {
		return fmt.Errorf("share_id is required")
	}
	if p.UserID == "" {
		return fmt.Errorf("user_id is required")
	}
	return nil
}

// Create creates a new recipient in Redis
func (p *RecipientCreateParams) Create() (*Recipient, error) {
	rdb, ctx := utils.GetRedisClient()

	// Validate
	if err := p.Validate(); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	// Check for duplicate contact
	if p.Email != "" {
		normalized := normalizeContact(p.Email)
		contactKey := fmt.Sprintf("015:contactIndex:%s", normalized)
		exists, err := rdb.Exists(ctx, contactKey).Result()
		if err != nil {
			return nil, err
		}
		if exists > 0 {
			return nil, fmt.Errorf("recipient with this email already exists")
		}
	}
	if p.Phone != "" {
		normalized := normalizeContact(p.Phone)
		contactKey := fmt.Sprintf("015:contactIndex:%s", normalized)
		exists, err := rdb.Exists(ctx, contactKey).Result()
		if err != nil {
			return nil, err
		}
		if exists > 0 {
			return nil, fmt.Errorf("recipient with this phone already exists")
		}
	}

	// Generate ID
	id := generateRecipientID()

	now := time.Now().Unix()
	recipient := &Recipient{
		ID:        id,
		UserID:    p.UserID,
		ShareID:   p.ShareID,
		Name:      strings.TrimSpace(p.Name),
		Email:     strings.TrimSpace(p.Email),
		Phone:     strings.TrimSpace(p.Phone),
		CreatedAt: now,
	}

	// Marshal recipient data
	data, err := json.Marshal(recipient)
	if err != nil {
		return nil, err
	}

	// Use pipeline for atomic multi-key operations
	pipe := rdb.Pipeline()

	// Store recipient
	key := fmt.Sprintf("015:recipient:%s", id)
	pipe.Set(ctx, key, string(data), 0)

	// Add to share recipients set
	shareKey := fmt.Sprintf("015:shareRecipients:%s", p.ShareID)
	pipe.SAdd(ctx, shareKey, id)

	// Add to user recipients set
	userKey := fmt.Sprintf("015:userRecipients:%s", p.UserID)
	pipe.SAdd(ctx, userKey, id)

	// Add to contact indices
	if recipient.Email != "" {
		contactKey := fmt.Sprintf("015:contactIndex:%s", normalizeContact(recipient.Email))
		pipe.Set(ctx, contactKey, id, 0)
	}
	if recipient.Phone != "" {
		contactKey := fmt.Sprintf("015:contactIndex:%s", normalizeContact(recipient.Phone))
		pipe.Set(ctx, contactKey, id, 0)
	}

	_, err = pipe.Exec(ctx)
	if err != nil {
		return nil, err
	}

	return recipient, nil
}

// GetByID retrieves a recipient by ID
func GetRecipientByID(id string) (*Recipient, error) {
	rdb, ctx := utils.GetRedisClient()

	key := fmt.Sprintf("015:recipient:%s", id)
	data, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var recipient Recipient
	if err := json.Unmarshal([]byte(data), &recipient); err != nil {
		return nil, err
	}

	return &recipient, nil
}

// GetRecipientsByShareID retrieves all recipients for a share using pipeline
func GetRecipientsByShareID(shareID string) ([]*Recipient, error) {
	rdb, ctx := utils.GetRedisClient()

	shareKey := fmt.Sprintf("015:shareRecipients:%s", shareID)
	recipientIDs, err := rdb.SMembers(ctx, shareKey).Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}

	return batchGetRecipients(ctx, rdb, recipientIDs)
}

// GetRecipientsByUserID retrieves all recipients for a user using pipeline
func GetRecipientsByUserID(userID string) ([]*Recipient, error) {
	rdb, ctx := utils.GetRedisClient()

	userKey := fmt.Sprintf("015:userRecipients:%s", userID)
	recipientIDs, err := rdb.SMembers(ctx, userKey).Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}

	return batchGetRecipients(ctx, rdb, recipientIDs)
}

// GetAllRecipients retrieves all recipients (for demo purposes)
func GetAllRecipients() ([]*Recipient, error) {
	rdb, ctx := utils.GetRedisClient()

	// Get all keys matching recipient pattern
	keys, err := rdb.Keys(ctx, "015:recipient:*").Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}

	if len(keys) == 0 {
		return []*Recipient{}, nil
	}

	// Get all recipients
	var recipients []*Recipient
	for _, key := range keys {
		data, err := rdb.Get(ctx, key).Result()
		if err == redis.Nil {
			continue
		}
		if err != nil {
			return nil, err
		}
		var recipient Recipient
		if err := json.Unmarshal([]byte(data), &recipient); err != nil {
			return nil, err
		}
		recipients = append(recipients, &recipient)
	}

	// Sort by CreatedAt descending
	sort.Slice(recipients, func(i, j int) bool {
		return recipients[i].CreatedAt > recipients[j].CreatedAt
	})

	return recipients, nil
}

// PaginatedRecipients holds paginated recipient results
type PaginatedRecipients struct {
	Recipients []*Recipient `json:"recipients"`
	NextCursor string       `json:"next_cursor"`
	TotalCount int64        `json:"total_count"`
}

// GetRecipientsByShareIDPaginated retrieves recipients for a share with pagination
func GetRecipientsByShareIDPaginated(shareID string, cursor uint64, limit int) (*PaginatedRecipients, error) {
	rdb, ctx := utils.GetRedisClient()

	shareKey := fmt.Sprintf("015:shareRecipients:%s", shareID)

	// Use SSCAN for cursor-based pagination
	var recipientIDs []string
	var nextCursor uint64
	var err error

	if cursor == 0 {
		// First page
		recipientIDs, nextCursor, err = rdb.SScan(ctx, shareKey, cursor, "*", int64(limit)).Result()
	} else {
		recipientIDs, nextCursor, err = rdb.SScan(ctx, shareKey, cursor, "*", int64(limit)).Result()
	}

	if err != nil {
		return nil, err
	}

	// Get total count
	totalCount, _ := rdb.SCard(ctx, shareKey).Result()

	// Batch fetch recipients using pipeline
	recipients := make([]*Recipient, 0, len(recipientIDs))
	if len(recipientIDs) > 0 {
		recipients, err = batchGetRecipients(ctx, rdb, recipientIDs)
		if err != nil {
			return nil, err
		}
	}

	return &PaginatedRecipients{
		Recipients: recipients,
		NextCursor: fmt.Sprintf("%d", nextCursor),
		TotalCount: totalCount,
	}, nil
}

// GetRecipientsByUserIDPaginated retrieves recipients for a user with pagination
func GetRecipientsByUserIDPaginated(userID string, cursor uint64, limit int) (*PaginatedRecipients, error) {
	rdb, ctx := utils.GetRedisClient()

	userKey := fmt.Sprintf("015:userRecipients:%s", userID)

	var recipientIDs []string
	var nextCursor uint64
	var err error

	recipientIDs, nextCursor, err = rdb.SScan(ctx, userKey, cursor, "*", int64(limit)).Result()
	if err != nil {
		return nil, err
	}

	totalCount, _ := rdb.SCard(ctx, userKey).Result()

	recipients := make([]*Recipient, 0, len(recipientIDs))
	if len(recipientIDs) > 0 {
		recipients, err = batchGetRecipients(ctx, rdb, recipientIDs)
		if err != nil {
			return nil, err
		}
	}

	return &PaginatedRecipients{
		Recipients: recipients,
		NextCursor: fmt.Sprintf("%d", nextCursor),
		TotalCount: totalCount,
	}, nil
}

// batchGetRecipients fetches multiple recipients using pipeline
func batchGetRecipients(ctx context.Context, rdb *redis.Client, ids []string) ([]*Recipient, error) {
	if len(ids) == 0 {
		return []*Recipient{}, nil
	}

	pipe := rdb.Pipeline()
	cmds := make([]*redis.StringCmd, len(ids))

	for i, id := range ids {
		key := fmt.Sprintf("015:recipient:%s", id)
		cmds[i] = pipe.Get(ctx, key)
	}

	_, err := pipe.Exec(ctx)
	if err != nil && err != redis.Nil {
		return nil, err
	}

	recipients := make([]*Recipient, 0, len(ids))
	for _, cmd := range cmds {
		data, err := cmd.Result()
		if err == redis.Nil {
			continue
		}
		if err != nil {
			continue
		}

		var recipient Recipient
		if err := json.Unmarshal([]byte(data), &recipient); err != nil {
			continue
		}
		recipients = append(recipients, &recipient)
	}

	return recipients, nil
}

// GetRecipientByContact retrieves a recipient by email or phone
func GetRecipientByContact(emailOrPhone string) (*Recipient, error) {
	rdb, ctx := utils.GetRedisClient()

	normalized := normalizeContact(emailOrPhone)
	contactKey := fmt.Sprintf("015:contactIndex:%s", normalized)
	recipientID, err := rdb.Get(ctx, contactKey).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return GetRecipientByID(recipientID)
}

// ContactExists checks if a contact (email or phone) already exists
func ContactExists(emailOrPhone string) (bool, string, error) {
	rdb, ctx := utils.GetRedisClient()

	normalized := normalizeContact(emailOrPhone)
	contactKey := fmt.Sprintf("015:contactIndex:%s", normalized)
	recipientID, err := rdb.Get(ctx, contactKey).Result()
	if err == redis.Nil {
		return false, "", nil
	}
	if err != nil {
		return false, "", err
	}

	return true, recipientID, nil
}

// CountRecipientsByShareID returns the count of recipients for a share
func CountRecipientsByShareID(shareID string) (int64, error) {
	rdb, ctx := utils.GetRedisClient()
	shareKey := fmt.Sprintf("015:shareRecipients:%s", shareID)
	return rdb.SCard(ctx, shareKey).Result()
}

// CountRecipientsByUserID returns the count of recipients for a user
func CountRecipientsByUserID(userID string) (int64, error) {
	rdb, ctx := utils.GetRedisClient()
	userKey := fmt.Sprintf("015:userRecipients:%s", userID)
	return rdb.SCard(ctx, userKey).Result()
}

// DeleteRecipient removes a recipient from Redis with ownership verification
func DeleteRecipient(id string, userID string) error {
	rdb, ctx := utils.GetRedisClient()

	// Get recipient first to clean up indices and verify ownership
	recipient, err := GetRecipientByID(id)
	if err != nil {
		return err
	}
	if recipient == nil {
		return nil // Already deleted
	}

	// Verify ownership
	if recipient.UserID != userID {
		return fmt.Errorf("unauthorized: recipient does not belong to user")
	}

	// Use pipeline for atomic deletion
	pipe := rdb.Pipeline()

	// Delete recipient
	key := fmt.Sprintf("015:recipient:%s", id)
	pipe.Del(ctx, key)

	// Remove from share recipients set
	shareKey := fmt.Sprintf("015:shareRecipients:%s", recipient.ShareID)
	pipe.SRem(ctx, shareKey, id)

	// Remove from user recipients set
	userKey := fmt.Sprintf("015:userRecipients:%s", recipient.UserID)
	pipe.SRem(ctx, userKey, id)

	// Remove from contact indices
	if recipient.Email != "" {
		contactKey := fmt.Sprintf("015:contactIndex:%s", normalizeContact(recipient.Email))
		pipe.Del(ctx, contactKey)
	}
	if recipient.Phone != "" {
		contactKey := fmt.Sprintf("015:contactIndex:%s", normalizeContact(recipient.Phone))
		pipe.Del(ctx, contactKey)
	}

	_, err = pipe.Exec(ctx)
	return err
}

// DeleteRecipientsByShareID removes all recipients for a share (cascade delete)
func DeleteRecipientsByShareID(shareID string) error {
	rdb, ctx := utils.GetRedisClient()

	shareKey := fmt.Sprintf("015:shareRecipients:%s", shareID)
	recipientIDs, err := rdb.SMembers(ctx, shareKey).Result()
	if err != nil && err != redis.Nil {
		return err
	}

	if len(recipientIDs) == 0 {
		return nil
	}

	// Delete all recipients in batch
	pipe := rdb.Pipeline()
	for _, id := range recipientIDs {
		key := fmt.Sprintf("015:recipient:%s", id)
		pipe.Del(ctx, key)
	}
	pipe.Del(ctx, shareKey)

	_, err = pipe.Exec(ctx)
	return err
}

// DeleteRecipientsByUserID removes all recipients for a user (cascade delete)
func DeleteRecipientsByUserID(userID string) error {
	rdb, ctx := utils.GetRedisClient()

	userKey := fmt.Sprintf("015:userRecipients:%s", userID)
	recipientIDs, err := rdb.SMembers(ctx, userKey).Result()
	if err != nil && err != redis.Nil {
		return err
	}

	if len(recipientIDs) == 0 {
		return nil
	}

	// Delete all recipients in batch
	pipe := rdb.Pipeline()
	for _, id := range recipientIDs {
		key := fmt.Sprintf("015:recipient:%s", id)
		pipe.Del(ctx, key)
	}
	pipe.Del(ctx, userKey)

	_, err = pipe.Exec(ctx)
	return err
}

// generateRecipientID generates a unique ID for a recipient
func generateRecipientID() string {
	return generateID()
}

// normalizeContact normalizes an email or phone for consistent indexing
func normalizeContact(contact string) string {
	// Lowercase for emails
	contact = strings.ToLower(strings.TrimSpace(contact))
	// Remove common formatting from phones
	contact = strings.ReplaceAll(contact, " ", "")
	contact = strings.ReplaceAll(contact, "-", "")
	contact = strings.ReplaceAll(contact, "(", "")
	contact = strings.ReplaceAll(contact, ")", "")
	return contact
}

// isValidEmail performs basic email validation
func isValidEmail(email string) bool {
	email = strings.TrimSpace(email)
	if email == "" {
		return false
	}
	// Basic format check
	atIndex := strings.Index(email, "@")
	if atIndex < 1 || atIndex > len(email)-3 {
		return false
	}
	domain := email[atIndex+1:]
	if !strings.Contains(domain, ".") {
		return false
	}
	return utf8.RuneCountInString(email) <= 254 // RFC 5321
}

// isValidPhone performs basic phone validation (E.164 format)
func isValidPhone(phone string) bool {
	phone = strings.TrimSpace(phone)
	if phone == "" {
		return false
	}
	// Allow +, digits, spaces, dashes, parentheses
	for _, r := range phone {
		if !((r >= '0' && r <= '9') || r == '+' || r == ' ' || r == '-' || r == '(' || r == ')') {
			return false
		}
	}
	return utf8.RuneCountInString(phone) <= 20
}
