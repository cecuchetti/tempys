package middleware

import (
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

const userIDCookieName = "user_id"

// CustomMiddleware 创建自定义中间件
func AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			sess, err := session.Get("session", c)
			if err != nil {
				return err
			}
			sess.Options = &sessions.Options{
				Path:     "/",
				MaxAge:   86400 * 7,
				HttpOnly: true,
			}

			// Check for persistent user_id cookie first
			var userID string
			cookie, err := c.Cookie(userIDCookieName)
			if err == nil && cookie != nil && cookie.Value != "" {
				userID = cookie.Value
			} else if sess.Values["auth"] != nil {
				// Fall back to session value
				userID = sess.Values["auth"].(string)
			}

			// Generate new ID if none exists
			if userID == "" {
				id, err := gonanoid.New()
				if err != nil {
					return err
				}
				userID = id
			}

			// Save to session
			sess.Values["auth"] = userID
			if err := sess.Save(c.Request(), c.Response()); err != nil {
				return err
			}

			// Set persistent cookie
			c.SetCookie(&http.Cookie{
				Name:     userIDCookieName,
				Value:    userID,
				Path:     "/",
				MaxAge:   86400 * 365, // 1 year
				HttpOnly: false,       // Allow JS access for debugging
				SameSite: http.SameSiteStrictMode,
			})

			c.Set("auth", userID)
			return next(c)
		}
	}
}
