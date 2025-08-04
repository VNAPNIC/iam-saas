package monitoring

import (
	"context"
	"encoding/json"
	"fmt"
	"iam-saas/internal/cache"
	"sync"
	"time"
)

// PerformanceMonitor tracks system performance metrics
type PerformanceMonitor struct {
	cacheManager *cache.CacheManager
	metrics      map[string]*MetricData
	mutex        sync.RWMutex
	startTime    time.Time
	metricsChan  chan MetricData
	stopChan     chan struct{}
}

// MetricData holds performance metric information
type MetricData struct {
	Name        string                 `json:"name"`
	Value       float64                `json:"value"`
	Unit        string                 `json:"unit"`
	Timestamp   time.Time              `json:"timestamp"`
	Tags        map[string]string      `json:"tags"`
	History     []HistoryPoint         `json:"history"`
	Threshold   *Threshold             `json:"threshold,omitempty"`
}

// HistoryPoint represents a historical metric value
type HistoryPoint struct {
	Value     float64   `json:"value"`
	Timestamp time.Time `json:"timestamp"`
}

// Threshold defines alert thresholds for metrics
type Threshold struct {
	Warning  float64 `json:"warning"`
	Critical float64 `json:"critical"`
	Operator string  `json:"operator"` // "gt", "lt", "eq"
}

// NewPerformanceMonitor creates a new performance monitor
func NewPerformanceMonitor(cacheManager *cache.CacheManager) *PerformanceMonitor {
	pm := &PerformanceMonitor{
		cacheManager: cacheManager,
		metrics:      make(map[string]*MetricData),
		startTime:    time.Now(),
	}

	// Start background metric collection
	go pm.startMetricCollection()
	
	return pm
}

// Start background metric collection
func (pm *PerformanceMonitor) startMetricCollection() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for metric := range pm.metricsChan {
		select {
		case <-pm.stopChan:
			return
		default:
			pm.processMetric(metric)
		}
	}
}

func (pm *PerformanceMonitor) processMetric(metric MetricData) {
	pm.mutex.Lock()
	defer pm.mutex.Unlock()

	now := time.Now()

	if existingMetric, exists := pm.metrics[metric.Name]; exists {
		// Update existing metric
		existingMetric.Value = metric.Value
		existingMetric.Timestamp = now
		existingMetric.Tags = metric.Tags
		existingMetric.Threshold = metric.Threshold

		// Add to history (keep last 100 points)
		existingMetric.History = append(existingMetric.History, HistoryPoint{
			Value:     metric.Value,
			Timestamp: now,
		})

		if len(existingMetric.History) > 100 {
			existingMetric.History = existingMetric.History[1:]
		}
	} else {
		// Create new metric
		pm.metrics[metric.Name] = &MetricData{
			Name:      metric.Name,
			Value:     metric.Value,
			Unit:      metric.Unit,
			Timestamp: now,
			Tags:      metric.Tags,
			Threshold: metric.Threshold,
			History: []HistoryPoint{{
				Value:     metric.Value,
				Timestamp: now,
			}},
		}
	}

	// Cache the metric for external access
	cacheKey := fmt.Sprintf("metrics:%s", metric.Name)
	_ = pm.cacheManager.Set(cacheKey, pm.metrics[metric.Name], 5*time.Minute)
}

// func (pm *PerformanceMonitor) collectSystemMetrics() {
// 	var m runtime.MemStats
// 	runtime.ReadMemStats(&m)
// 
// 	// Memory metrics
// 	pm.RecordMetric("system.memory.heap_used", float64(m.HeapInuse)/1024/1024, "MB", map[string]string{
// 		"type": "heap",
// 	}, &Threshold{Warning: 500, Critical: 1000, Operator: "gt"})
// 
// 	pm.RecordMetric("system.memory.heap_allocated", float64(m.HeapAlloc)/1024/1024, "MB", map[string]string{
// 		"type": "heap",
// 	}, nil)
// 
// 	pm.RecordMetric("system.memory.gc_cycles", float64(m.NumGC), "count", map[string]string{
// 		"type": "gc",
// 	}, nil)
// 
// 	// Goroutine count
// 	pm.RecordMetric("system.goroutines", float64(runtime.NumGoroutine()), "count", map[string]string{
// 		"type": "runtime",
// 	}, &Threshold{Warning: 1000, Critical: 5000, Operator: "gt"})
// 
// 	// CPU count
// 	pm.RecordMetric("system.cpu_count", float64(runtime.NumCPU()), "count", map[string]string{
// 		"type": "cpu",
// 	}, nil)
// }

// func (pm *PerformanceMonitor) collectApplicationMetrics() {
// 	// Cache metrics
// 	if cacheMetrics, err := pm.cacheManager.GetCacheMetrics(); err == nil {
// 		pm.RecordMetric("cache.hit_rate", cacheMetrics.HitRate*100, "percent", map[string]string{
// 			"component": "cache",
// 		}, &Threshold{Warning: 80, Critical: 60, Operator: "lt"})
// 
// 		pm.RecordMetric("cache.total_keys", float64(cacheMetrics.TotalKeys), "count", map[string]string{
// 			"component": "cache",
// 		}, nil)
// 
// 		pm.RecordMetric("cache.connections", float64(cacheMetrics.Connections), "count", map[string]string{
// 			"component": "cache",
// 		}, &Threshold{Warning: 50, Critical: 100, Operator: "gt"})
// 	}
// 
// 	// Uptime
// 	uptime := time.Since(pm.startTime).Seconds()
// 	pm.RecordMetric("system.uptime", uptime, "seconds", map[string]string{
// 		"type": "system",
// 	}, nil)
// }

// Record a custom metric
func (pm *PerformanceMonitor) RecordMetric(name string, value float64, unit string, tags map[string]string, threshold *Threshold) {
	pm.mutex.Lock()
	defer pm.mutex.Unlock()

	now := time.Now()
	
	if metric, exists := pm.metrics[name]; exists {
		// Update existing metric
		metric.Value = value
		metric.Timestamp = now
		metric.Tags = tags
		metric.Threshold = threshold
		
		// Add to history (keep last 100 points)
		metric.History = append(metric.History, HistoryPoint{
			Value:     value,
			Timestamp: now,
		})
		
		if len(metric.History) > 100 {
			metric.History = metric.History[1:]
		}
	} else {
		// Create new metric
		pm.metrics[name] = &MetricData{
			Name:      name,
			Value:     value,
			Unit:      unit,
			Timestamp: now,
			Tags:      tags,
			Threshold: threshold,
			History: []HistoryPoint{{
				Value:     value,
				Timestamp: now,
			}},
		}
	}

	// Cache the metric for external access
	cacheKey := fmt.Sprintf("metrics:%s", name)
	_ = pm.cacheManager.Set(cacheKey, pm.metrics[name], 5*time.Minute)
}

// Get all metrics
func (pm *PerformanceMonitor) GetAllMetrics() map[string]*MetricData {
	pm.mutex.RLock()
	defer pm.mutex.RUnlock()

	// Create a copy to avoid race conditions
	result := make(map[string]*MetricData)
	for name, metric := range pm.metrics {
		result[name] = metric
	}
	
	return result
}

// Get specific metric
func (pm *PerformanceMonitor) GetMetric(name string) (*MetricData, bool) {
	pm.mutex.RLock()
	defer pm.mutex.RUnlock()

	metric, exists := pm.metrics[name]
	return metric, exists
}

// Get metrics by tag
func (pm *PerformanceMonitor) GetMetricsByTag(tagKey, tagValue string) map[string]*MetricData {
	pm.mutex.RLock()
	defer pm.mutex.RUnlock()

	result := make(map[string]*MetricData)
	for name, metric := range pm.metrics {
		if value, exists := metric.Tags[tagKey]; exists && value == tagValue {
			result[name] = metric
		}
	}
	
	return result
}

// func (pm *PerformanceMonitor) checkThresholds() {
// 	pm.mutex.RLock()
// 	defer pm.mutex.RUnlock()
// 
// 	for name, metric := range pm.metrics {
// 		if metric.Threshold == nil {
// 			continue
// 		}
// 
// 		alertLevel := pm.evaluateThreshold(metric.Value, metric.Threshold)
// 		if alertLevel != "" {
// 			pm.generateAlert(name, metric, alertLevel)
// 		}
// 	}
// }

// Evaluate threshold and return alert level
func (pm *PerformanceMonitor) evaluateThreshold(value float64, threshold *Threshold) string {
	switch threshold.Operator {
	case "gt":
		if value >= threshold.Critical {
			return "critical"
		} else if value >= threshold.Warning {
			return "warning"
		}
	case "lt":
		if value <= threshold.Critical {
			return "critical"
		} else if value <= threshold.Warning {
			return "warning"
		}
	case "eq":
		if value == threshold.Critical {
			return "critical"
		} else if value == threshold.Warning {
			return "warning"
		}
	}
	return ""
}

// func (pm *PerformanceMonitor) generateAlert(metricName string, metric *MetricData, level string) {
// 	alert := Alert{
// 		ID:          fmt.Sprintf("perf_%s_%d", metricName, time.Now().Unix()),
// 		Type:        "performance",
// 		Level:       level,
// 		Title:       fmt.Sprintf("Performance Alert: %s", metricName),
// 		Description: fmt.Sprintf("Metric %s has value %.2f %s", metricName, metric.Value, metric.Unit),
// 		MetricName:  metricName,
// 		MetricValue: metric.Value,
// 		Threshold:   metric.Threshold,
// 		Timestamp:   time.Now(),
// 		Tags:        metric.Tags,
// 	}
// 
// 	// Store alert in cache
// 	alertKey := fmt.Sprintf("alerts:performance:%s", alert.ID)
// 	_ = pm.cacheManager.Set(alertKey, alert, 24*time.Hour)
// 
// 	// Store in alerts list
// 	alertsListKey := "alerts:performance:list"
// 	alertData, _ := json.Marshal(alert)
// 	pm.cacheManager.RedisCache.Client.LPush(context.Background(), alertsListKey, alertData)
// 	pm.cacheManager.RedisCache.Client.LTrim(context.Background(), alertsListKey, 0, 999) // Keep last 1000 alerts
// }

// Alert represents a performance alert
type Alert struct {
	ID          string             `json:"id"`
	Type        string             `json:"type"`
	Level       string             `json:"level"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	MetricName  string             `json:"metric_name"`
	MetricValue float64            `json:"metric_value"`
	Threshold   *Threshold         `json:"threshold"`
	Timestamp   time.Time          `json:"timestamp"`
	Tags        map[string]string  `json:"tags"`
}

// Get recent alerts
func (pm *PerformanceMonitor) GetRecentAlerts(limit int) ([]Alert, error) {
	alertsListKey := "alerts:performance:list"
	
	alertStrings, err := pm.cacheManager.RedisCache.Client.LRange(context.Background(), alertsListKey, 0, int64(limit-1)).Result()
	if err != nil {
		return nil, err
	}

	var alerts []Alert
	for _, alertString := range alertStrings {
		var alert Alert
		if err := json.Unmarshal([]byte(alertString), &alert); err == nil {
			alerts = append(alerts, alert)
		}
	}

	return alerts, nil
}

// Get system health summary
func (pm *PerformanceMonitor) GetHealthSummary() *HealthSummary {
	pm.mutex.RLock()
	defer pm.mutex.RUnlock()

	summary := &HealthSummary{
		Status:    "healthy",
		Timestamp: time.Now(),
		Metrics:   make(map[string]interface{}),
		Issues:    []string{},
	}

	criticalCount := 0
	warningCount := 0

	for name, metric := range pm.metrics {
		summary.Metrics[name] = metric.Value

		if metric.Threshold != nil {
			alertLevel := pm.evaluateThreshold(metric.Value, metric.Threshold)
			if alertLevel == "critical" {
				criticalCount++
				summary.Issues = append(summary.Issues, fmt.Sprintf("Critical: %s = %.2f %s", name, metric.Value, metric.Unit))
			} else if alertLevel == "warning" {
				warningCount++
				summary.Issues = append(summary.Issues, fmt.Sprintf("Warning: %s = %.2f %s", name, metric.Value, metric.Unit))
			}
		}
	}

	if criticalCount > 0 {
		summary.Status = "critical"
	} else if warningCount > 0 {
		summary.Status = "warning"
	}

	summary.CriticalCount = criticalCount
	summary.WarningCount = warningCount

	return summary
}

// HealthSummary represents overall system health
type HealthSummary struct {
	Status        string                 `json:"status"`
	Timestamp     time.Time              `json:"timestamp"`
	Metrics       map[string]interface{} `json:"metrics"`
	Issues        []string               `json:"issues"`
	CriticalCount int                    `json:"critical_count"`
	WarningCount  int                    `json:"warning_count"`
}

// Record request timing
func (pm *PerformanceMonitor) RecordRequestTiming(endpoint string, duration time.Duration, statusCode int) {
	tags := map[string]string{
		"endpoint":    endpoint,
		"status_code": fmt.Sprintf("%d", statusCode),
	}

	pm.RecordMetric(fmt.Sprintf("http.request.duration.%s", endpoint), duration.Seconds()*1000, "ms", tags, &Threshold{
		Warning:  1000, // 1 second
		Critical: 5000, // 5 seconds
		Operator: "gt",
	})

	pm.RecordMetric(fmt.Sprintf("http.request.count.%s", endpoint), 1, "count", tags, nil)
}

// Record database query timing
func (pm *PerformanceMonitor) RecordDatabaseTiming(operation string, duration time.Duration) {
	tags := map[string]string{
		"operation": operation,
		"component": "database",
	}

	pm.RecordMetric(fmt.Sprintf("db.query.duration.%s", operation), duration.Seconds()*1000, "ms", tags, &Threshold{
		Warning:  500,  // 500ms
		Critical: 2000, // 2 seconds
		Operator: "gt",
	})
}

// Record cache operation timing
func (pm *PerformanceMonitor) RecordCacheTiming(operation string, duration time.Duration, hit bool) {
	tags := map[string]string{
		"operation": operation,
		"component": "cache",
		"hit":       fmt.Sprintf("%t", hit),
	}

	pm.RecordMetric(fmt.Sprintf("cache.operation.duration.%s", operation), duration.Seconds()*1000, "ms", tags, &Threshold{
		Warning:  100, // 100ms
		Critical: 500, // 500ms
		Operator: "gt",
	})
}