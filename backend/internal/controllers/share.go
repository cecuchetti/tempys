package controllers

import (
	"backend/internal/utils"
	"encoding/json"
	"pkg/models"
	u "pkg/utils"
	"strings"
	"time"

	"github.com/hibiken/asynq"
	"github.com/labstack/echo/v4"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"github.com/spf13/cast"
)

// ShareListItem represents a share in the list response
type ShareListItem struct {
	ID          string `json:"id"`
	Type        string `json:"type"`
	Name        string `json:"name"`
	CreatedAt   int64  `json:"created_at"`
	ExpireAt    int64  `json:"expire_at"`
	Views       int64  `json:"views"`
	ViewsLeft   int64  `json:"views_left"`
	HasPassword bool   `json:"has_password"`
	Size        int64  `json:"size,omitempty"`
}

type CreateShareProps struct {
	Type models.ShareType `json:"type"`
	// ShareId string           `json:"id"`
	Config   ShareConfig `json:"config"`
	Data     string      `json:"data"`
	FileName string      `json:"file_name"`
}

type ShareConfig struct {
	ExpireAt      int      `json:"expire_time"` // 分钟
	ViewNum       int64    `json:"download_nums"`
	HasPassword   bool     `json:"has_password"`
	Password      string   `json:"password"`
	HasNotify     bool     `json:"has_notify"`
	NotifyEmail   []string `json:"notify_email"`
	HasPickupCode bool     `json:"has_pickup_code"`
}

func CreateShareInfo(c echo.Context) error {
	authVal := c.Get("auth")
	owner, _ := authVal.(string)

	r := new(CreateShareProps)
	if err := c.Bind(r); err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	if r.Config.ExpireAt < 1 {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}
	ExpireTime := time.Now().Add(time.Duration(r.Config.ExpireAt) * time.Minute)
	if r.Data == "" || (r.Type != models.ShareTypeFile && r.Type != models.ShareTypeText) || ExpireTime.Before(time.Now()) || r.Config.ViewNum < 1 {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	id, err := gonanoid.New()
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	if r.Type == models.ShareTypeFile {
		fileInfo, err := models.GetRedisFileInfo(r.Data)
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		if fileInfo == nil {
			return utils.HTTPErrorHandler(c, ErrShareFileNotFound)
		}
		if fileInfo.FileType != models.FileTypeUpload {
			return utils.HTTPErrorHandler(c, ErrInvalidShareFileState)
		}
	}
	password := ""
	if r.Config.Password != "" {
		hash, err := utils.GeneratePasswordHash(r.Config.Password)
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		password = hash
	}

	err = models.SetRedisShareInfo(id, models.RedisShareInfo{
		Data:      r.Data,
		Type:      r.Type,
		CreatedAt: time.Now().Unix(),
		Owner:     owner,
		ViewNum:   r.Config.ViewNum,
		Password:  password,
		// NotifyEmail: r.Config.NotifyEmail,
		FileName: r.FileName,
		ExpireAt: ExpireTime.Unix(),
	})
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	// Track user share relationship
	if owner != "" {
		if err := models.AddUserShare(owner, id, ExpireTime.Unix()); err != nil {
			// Log error but don't fail the request
			// This is a non-critical operation
		}
	}
	var pickupCode string
	if r.Config.HasPickupCode {
		for {
			pickupCode = utils.GeneratePickupCode()
			ok, err := models.SetRedisPickupData(pickupCode, id)
			if err != nil {
				return utils.HTTPErrorHandler(c, err)
			}
			if !ok {
				continue
			}
			break
		}
	}

	if r.Type == models.ShareTypeFile {
		shareIDs, err := models.GetRedisFileShareRelational(r.Data)
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		shareIDs = append(shareIDs, id)
		err = models.SetRedisFileShareRelational(r.Data, shareIDs)
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		client := u.GetQueueClient()
		json, err := json.Marshal(map[string]any{"share_id": id, "file_id": r.Data})
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		// 这里延时分享过期时间基础上加下载窗口期后1小时删除，防止用户过期前几分钟才开始下载，下载一半文件不见了
		downloadWindow := u.GetEnvWithDefault("share.download_window", "12")
		deleteTime := time.Duration(r.Config.ExpireAt)*time.Minute + cast.ToDuration(downloadWindow+"h") + 1*time.Hour
		_, err = client.Enqueue(asynq.NewTask("share:remove", json), asynq.ProcessIn(deleteTime))
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
	}

	// 统计分享数
	currentDate := time.Now().Format("2006-01-02")
	statData, _ := models.GetRedisStat(currentDate)
	if statData == nil {
		statData = &models.StatData{
			FileSize:    0,
			FileNum:     0,
			ShareNum:    0,
			DownloadNum: 0,
		}
	}
	statData.ShareNum += 1
	err = models.SetRedisStat(currentDate, *statData)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"id":            id,
		"file_name":     r.FileName,
		"download_nums": r.Config.ViewNum,
		"expire_at":     ExpireTime.Unix(),
		"pickup_code":   pickupCode,
	})
}

type GetShareProps struct {
	ShareId string `param:"id"`
}

func GetShareInfo(c echo.Context) error {
	shareId := c.Param("id")
	if shareId == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}

	shareInfo, err := models.GetRedisShareInfo(shareId)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	if shareInfo == nil || shareInfo.ViewNum < 1 {
		return utils.HTTPErrorHandler(c, ErrShareNotFound)
	}

	if shareInfo.Type == models.ShareTypeFile {
		fileInfo, err := models.GetRedisFileInfo(shareInfo.Data)
		if err != nil {
			return utils.HTTPErrorHandler(c, err)
		}
		if fileInfo == nil {
			return utils.HTTPErrorHandler(c, ErrShareFileNotFound)
		}
		if fileInfo.FileType != models.FileTypeUpload {
			return utils.HTTPErrorHandler(c, ErrInvalidShareFileState)
		}
		return utils.HTTPSuccessHandler(c, map[string]any{
			"id":            shareId,
			"type":          shareInfo.Type,
			"name":          shareInfo.FileName,
			"download_nums": shareInfo.ViewNum,
			"has_password":  shareInfo.Password != "",
			"expire_at":     shareInfo.ExpireAt,
			"owner":         shareInfo.Owner,
			"size":          fileInfo.FileSize,
			"mime_type":     fileInfo.MimeType,
		})
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"id":            shareId,
		"type":          shareInfo.Type,
		"name":          shareInfo.FileName,
		"download_nums": shareInfo.ViewNum,
		"has_password":  shareInfo.Password != "",
		"expire_at":     shareInfo.ExpireAt,
		"owner":         shareInfo.Owner,
	})
}

func GetShareByPickupCode(c echo.Context) error {
	pickupCode := c.Param("code")
	if pickupCode == "" {
		return utils.HTTPErrorHandler(c, ErrInvalidRequest)
	}
	shareId, err := models.GetRedisPickupData(strings.ToUpper(pickupCode))
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}
	if shareId == "" {
		return utils.HTTPErrorHandler(c, ErrShareNotFound)
	}
	return utils.HTTPSuccessHandler(c, map[string]any{
		"share_id": shareId,
	})
}

// GetUserShares returns all shares for the authenticated user
func GetUserShares(c echo.Context) error {
	// Get user ID from context (set by AuthMiddleware)
	authVal := c.Get("auth")
	owner, ok := authVal.(string)
	if !ok || owner == "" {
		return utils.HTTPErrorHandler(c, ErrUnauthorized)
	}

	// Get share IDs for this user
	shareIds, err := models.GetUserShares(owner)
	if err != nil {
		return utils.HTTPErrorHandler(c, err)
	}

	// Build list of shares with their details
	var shares []ShareListItem
	for _, shareId := range shareIds {
		shareInfo, err := models.GetRedisShareInfo(shareId)
		if err != nil || shareInfo == nil {
			// Skip invalid or expired shares
			continue
		}

		item := ShareListItem{
			ID:          shareId,
			Type:        string(shareInfo.Type),
			Name:        shareInfo.FileName,
			CreatedAt:   shareInfo.CreatedAt,
			ExpireAt:    shareInfo.ExpireAt,
			Views:       shareInfo.ViewNum,
			HasPassword: shareInfo.Password != "",
		}

		// For file shares, get file size
		if shareInfo.Type == models.ShareTypeFile && shareInfo.Data != "" {
			fileInfo, err := models.GetRedisFileInfo(shareInfo.Data)
			if err == nil && fileInfo != nil {
				item.Size = fileInfo.FileSize
			}
		}

		shares = append(shares, item)
	}

	return utils.HTTPSuccessHandler(c, map[string]any{
		"shares": shares,
		"total":  len(shares),
	})
}
