package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"net/http"
	"time"
)

type siemForwarder struct {
	httpClient *http.Client
}

func NewSIEMForwarder() domain.SIEMForwarder {
	return &siemForwarder{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *siemForwarder) ForwardLogs(ctx context.Context, tenantID int64, logs []entities.AuditLog) error {
	// This would be called by a background service to forward audit logs
	// For now, we'll implement a basic version
	
	// In a real implementation, you would:
	// 1. Get the SIEM configuration for the tenant
	// 2. Format the logs according to the configured format
	// 3. Send them to the configured endpoint
	// 4. Handle retries and failures
	
	return nil
}

func (s *siemForwarder) TestConnection(ctx context.Context, config *entities.SIEMConfig) error {
	if config.EndpointURL == "" {
		return fmt.Errorf("endpoint URL is required")
	}

	// Create a test payload
	testPayload := map[string]interface{}{
		"test":      true,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"message":   "IAM SaaS SIEM connection test",
		"source":    "iam-saas",
	}

	var payload []byte
	var contentType string
	var err error

	switch config.Format {
	case "json":
		payload, err = json.Marshal(testPayload)
		contentType = "application/json"
	case "syslog":
		// Format as syslog
		payload = []byte(fmt.Sprintf("<134>%s iam-saas: %s", 
			time.Now().Format(time.RFC3339), 
			"IAM SaaS SIEM connection test"))
		contentType = "text/plain"
	case "cef":
		// Format as Common Event Format
		payload = []byte(fmt.Sprintf("CEF:0|IAM SaaS|IAM|1.0|TEST|Connection Test|1|msg=%s", 
			"IAM SaaS SIEM connection test"))
		contentType = "text/plain"
	default:
		payload, err = json.Marshal(testPayload)
		contentType = "application/json"
	}

	if err != nil {
		return fmt.Errorf("failed to format payload: %v", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", config.EndpointURL, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", contentType)
	req.Header.Set("User-Agent", "IAM-SaaS-SIEM-Forwarder/1.0")
	
	if config.AuthHeader != "" {
		req.Header.Set("Authorization", config.AuthHeader)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("SIEM endpoint returned status: %d", resp.StatusCode)
	}

	return nil
}