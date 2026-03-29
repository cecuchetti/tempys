package models

import (
	"encoding/json"
	"fmt"
	"time"

	"pkg/utils"

	"dario.cat/mergo"
	"github.com/redis/go-redis/v9"
)

type RedisShareInfo struct {
	// Id          string    `json:"id"`
	CreatedAt   int64     `json:"created_at"`
	Owner       string    `json:"owner"`
	Type        ShareType `json:"type"`
	Data        string    `json:"data"` // 分享数据 文件分享为文件id 文本分享为文本内容
	ExpireAt    int64     `json:"expire_time"`
	ViewNum     int64     `json:"download_nums"`
	Password    string    `json:"password"`
	NotifyEmail []string  `json:"notify_email"`
	FileName    string    `json:"file_name"`
	// PickupCode  bool      `json:"pickup_code"`
}

type ShareType string

const (
	ShareTypeFile ShareType = "file"
	ShareTypeText ShareType = "text"
)

func GetRedisShareInfo(shareId string) (*RedisShareInfo, error) {
	rdb, ctx := utils.GetRedisClient()
	shareInfo := rdb.Get(ctx, fmt.Sprintf("015:shareInfoMap:%s", shareId))
	shareInfoUnmarshalData, err := shareInfo.Result()
	ttl, _ := rdb.TTL(ctx, fmt.Sprintf("015:shareInfoMap:%s", shareId)).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var shareInfoData RedisShareInfo

	if err := json.Unmarshal([]byte(shareInfoUnmarshalData), &shareInfoData); err != nil {
		return nil, err
	}
	shareInfoData.ExpireAt = time.Now().Add(ttl).Unix()
	return &shareInfoData, nil
}

// AddUserShare adds a share ID to the user's share list
func AddUserShare(userID string, shareId string, expireAt int64) error {
	rdb, ctx := utils.GetRedisClient()
	// Calculate TTL from expireAt
	ttl := time.Until(time.Unix(expireAt, 0))
	if ttl < 0 {
		ttl = time.Hour // Default fallback
	}
	_, err := rdb.SAdd(ctx, fmt.Sprintf("015:userShares:%s", userID), shareId).Result()
	if err != nil {
		return err
	}
	// Set expiration for the set
	rdb.Expire(ctx, fmt.Sprintf("015:userShares:%s", userID), ttl)
	return nil
}

// GetUserShares returns all share IDs for a user
func GetUserShares(userID string) ([]string, error) {
	rdb, ctx := utils.GetRedisClient()
	shareIds, err := rdb.SMembers(ctx, fmt.Sprintf("015:userShares:%s", userID)).Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}
	return shareIds, nil
}

// RemoveUserShare removes a share ID from the user's share list
func RemoveUserShare(userID string, shareId string) error {
	rdb, ctx := utils.GetRedisClient()
	_, err := rdb.SRem(ctx, fmt.Sprintf("015:userShares:%s", userID), shareId).Result()
	if err != nil && err != redis.Nil {
		return err
	}
	return nil
}

func SetRedisShareInfo(shareId string, shareInfo RedisShareInfo) error {
	rdb, ctx := utils.GetRedisClient()
	old_shareInfo, err := GetRedisShareInfo(shareId)
	if err != nil {
		return err
	}
	if old_shareInfo != nil {
		mergo.Merge(&shareInfo, old_shareInfo)
	}
	jsonData, _ := json.Marshal(shareInfo)
	_, err = rdb.Set(ctx, fmt.Sprintf("015:shareInfoMap:%s", shareId), string(jsonData), time.Until(time.Unix(shareInfo.ExpireAt, 0))).Result()
	return err
}
