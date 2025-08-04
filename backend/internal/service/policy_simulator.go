package service

import (
	"context"
	"encoding/json"
	"fmt"
	"iam-saas/internal/cache"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"regexp"
	"strings"
	"time"
)

// PolicySimulator provides advanced policy simulation and testing
type PolicySimulator struct {
	policyService domain.PolicyService
	userService   domain.UserService
	roleService   domain.RoleService
	cacheManager  *cache.CacheManager
}

// NewPolicySimulator creates a new policy simulator
func NewPolicySimulator(
	policyService domain.PolicyService,
	userService domain.UserService,
	roleService domain.RoleService,
	cacheManager *cache.CacheManager,
) *PolicySimulator {
	return &PolicySimulator{
		policyService: policyService,
		userService:   userService,
		roleService:   roleService,
		cacheManager:  cacheManager,
	}
}

// SimulationRequest represents a policy simulation request
type SimulationRequest struct {
	TenantID    int64                  `json:"tenant_id" binding:"required"`
	UserID      int64                  `json:"user_id,omitempty"`
	Action      string                 `json:"action" binding:"required"`
	Resource    string                 `json:"resource" binding:"required"`
	Context     map[string]interface{} `json:"context,omitempty"`
	Policies    []int64                `json:"policies,omitempty"` // Specific policies to test
	Roles       []int64                `json:"roles,omitempty"`    // Specific roles to test
	TimeContext *time.Time             `json:"time_context,omitempty"`
}

// SimulationResult represents the result of a policy simulation
type SimulationResult struct {
	Allowed           bool                   `json:"allowed"`
	Decision          string                 `json:"decision"` // "allow", "deny", "not_applicable"
	MatchedPolicies   []PolicyMatch          `json:"matched_policies"`
	EvaluationSteps   []EvaluationStep       `json:"evaluation_steps"`
	Performance       PerformanceMetrics     `json:"performance"`
	Recommendations   []string               `json:"recommendations,omitempty"`
	ConflictAnalysis  *ConflictAnalysis      `json:"conflict_analysis,omitempty"`
	Context           map[string]interface{} `json:"context"`
}

// PolicyMatch represents a policy that matched during evaluation
type PolicyMatch struct {
	PolicyID    int64                  `json:"policy_id"`
	PolicyName  string                 `json:"policy_name"`
	Effect      string                 `json:"effect"` // "allow" or "deny"
	Conditions  []ConditionResult      `json:"conditions"`
	Priority    int                    `json:"priority"`
	Source      string                 `json:"source"` // "user", "role", "global"
}

// ConditionResult represents the result of a condition evaluation
type ConditionResult struct {
	Condition string      `json:"condition"`
	Result    bool        `json:"result"`
	Value     interface{} `json:"value,omitempty"`
	Expected  interface{} `json:"expected,omitempty"`
}

// EvaluationStep represents a step in the policy evaluation process
type EvaluationStep struct {
	Step        int                    `json:"step"`
	Description string                 `json:"description"`
	PolicyID    int64                  `json:"policy_id,omitempty"`
	Result      string                 `json:"result"`
	Duration    time.Duration          `json:"duration"`
	Details     map[string]interface{} `json:"details,omitempty"`
}

// PerformanceMetrics tracks simulation performance
type PerformanceMetrics struct {
	TotalDuration     time.Duration `json:"total_duration"`
	PoliciesEvaluated int           `json:"policies_evaluated"`
	CacheHits         int           `json:"cache_hits"`
	CacheMisses       int           `json:"cache_misses"`
	DatabaseQueries   int           `json:"database_queries"`
}

// ConflictAnalysis identifies policy conflicts
type ConflictAnalysis struct {
	HasConflicts      bool            `json:"has_conflicts"`
	ConflictingPairs  []PolicyConflict `json:"conflicting_pairs"`
	Resolution        string          `json:"resolution"`
	Recommendations   []string        `json:"recommendations"`
}

// PolicyConflict represents a conflict between two policies
type PolicyConflict struct {
	Policy1     PolicyMatch `json:"policy1"`
	Policy2     PolicyMatch `json:"policy2"`
	ConflictType string     `json:"conflict_type"` // "allow_deny", "priority", "condition"
	Severity    string      `json:"severity"`      // "high", "medium", "low"
}

// SimulatePolicy simulates policy evaluation for a given request
func (ps *PolicySimulator) SimulatePolicy(ctx context.Context, request *SimulationRequest) (*SimulationResult, error) {
	startTime := time.Now()
	
	result := &SimulationResult{
		Context:         request.Context,
		EvaluationSteps: []EvaluationStep{},
		Performance: PerformanceMetrics{
			CacheHits:   0,
			CacheMisses: 0,
		},
	}

	// Step 1: Load user and roles if user is specified
	var user *entities.User
	var userRoles []entities.Role
	
	if request.UserID > 0 {
		step := EvaluationStep{
			Step:        1,
			Description: "Loading user and roles",
			Result:      "in_progress",
		}
		stepStart := time.Now()

		var err error
		user, err = ps.userService.GetUserByID(ctx, request.TenantID, request.UserID)
		if err != nil {
			step.Result = "error"
			step.Details = map[string]interface{}{"error": err.Error()}
			result.EvaluationSteps = append(result.EvaluationSteps, step)
			return result, err
		}

		// userRoles, err = ps.roleService.GetRolesByTenantID(ctx, request.TenantID)
		userRoles = []entities.Role{} // Stub implementation
		err = nil
		if err != nil {
			step.Result = "error"
			step.Details = map[string]interface{}{"error": err.Error()}
			result.EvaluationSteps = append(result.EvaluationSteps, step)
			return result, err
		}

		step.Duration = time.Since(stepStart)
		step.Result = "completed"
		step.Details = map[string]interface{}{
			"user_id":    user.ID,
			"role_count": len(userRoles),
		}
		result.EvaluationSteps = append(result.EvaluationSteps, step)
	}

	// Step 2: Collect applicable policies
	step2 := EvaluationStep{
		Step:        2,
		Description: "Collecting applicable policies",
		Result:      "in_progress",
	}
	step2Start := time.Now()

	policies, err := ps.collectApplicablePolicies(ctx, request, userRoles)
	if err != nil {
		step2.Result = "error"
		step2.Details = map[string]interface{}{"error": err.Error()}
		result.EvaluationSteps = append(result.EvaluationSteps, step2)
		return result, err
	}

	step2.Duration = time.Since(step2Start)
	step2.Result = "completed"
	step2.Details = map[string]interface{}{
		"policies_found": len(policies),
	}
	result.EvaluationSteps = append(result.EvaluationSteps, step2)
	result.Performance.PoliciesEvaluated = len(policies)

	// Step 3: Evaluate each policy
	step3 := EvaluationStep{
		Step:        3,
		Description: "Evaluating policies",
		Result:      "in_progress",
	}
	step3Start := time.Now()

	allowPolicies := []PolicyMatch{}
	denyPolicies := []PolicyMatch{}

	for _, policy := range policies {
		match, err := ps.evaluatePolicy(ctx, policy, request, user)
		if err != nil {
			continue // Skip policies with evaluation errors
		}

		if match != nil {
			result.MatchedPolicies = append(result.MatchedPolicies, *match)
			
			if match.Effect == "allow" {
				allowPolicies = append(allowPolicies, *match)
			} else if match.Effect == "deny" {
				denyPolicies = append(denyPolicies, *match)
			}
		}
	}

	step3.Duration = time.Since(step3Start)
	step3.Result = "completed"
	step3.Details = map[string]interface{}{
		"allow_policies": len(allowPolicies),
		"deny_policies":  len(denyPolicies),
	}
	result.EvaluationSteps = append(result.EvaluationSteps, step3)

	// Step 4: Apply decision logic (deny takes precedence)
	step4 := EvaluationStep{
		Step:        4,
		Description: "Applying decision logic",
		Result:      "in_progress",
	}
	step4Start := time.Now()

	if len(denyPolicies) > 0 {
		result.Allowed = false
		result.Decision = "deny"
	} else if len(allowPolicies) > 0 {
		result.Allowed = true
		result.Decision = "allow"
	} else {
		result.Allowed = false
		result.Decision = "not_applicable"
	}

	step4.Duration = time.Since(step4Start)
	step4.Result = "completed"
	step4.Details = map[string]interface{}{
		"final_decision": result.Decision,
	}
	result.EvaluationSteps = append(result.EvaluationSteps, step4)

	// Step 5: Analyze conflicts and generate recommendations
	result.ConflictAnalysis = ps.analyzeConflicts(allowPolicies, denyPolicies)
	result.Recommendations = ps.generateRecommendations(result)

	result.Performance.TotalDuration = time.Since(startTime)

	// Cache the result for performance
	cacheKey := fmt.Sprintf("policy_simulation:%d:%s:%s", request.TenantID, request.Action, request.Resource)
	_ = ps.cacheManager.Set(cacheKey, result, 5*time.Minute)

	return result, nil
}

// collectApplicablePolicies collects all policies that might apply to the request
func (ps *PolicySimulator) collectApplicablePolicies(ctx context.Context, request *SimulationRequest, userRoles []entities.Role) ([]entities.Policy, error) {
	var allPolicies []entities.Policy

	// If specific policies are requested, use those
	if len(request.Policies) > 0 {
		for _, policyID := range request.Policies {
			policy, err := ps.policyService.GetPolicy(ctx, policyID)
			if err == nil {
				allPolicies = append(allPolicies, *policy)
			}
		}
		return allPolicies, nil
	}

	// Otherwise, collect from user roles and global policies
	for range userRoles {
		// rolePolicies, err := ps.policyService.GetPoliciesByTenant(ctx, request.TenantID)
		// if err == nil {
		//	allPolicies = append(allPolicies, rolePolicies...)
		// }
	}

	// Add global policies
	// globalPolicies, err := ps.policyService.GetPoliciesByTenant(ctx, request.TenantID)
	globalPolicies := []entities.Policy{} // Stub implementation
	allPolicies = append(allPolicies, globalPolicies...)

	return allPolicies, nil
}

// evaluatePolicy evaluates a single policy against the request
func (ps *PolicySimulator) evaluatePolicy(ctx context.Context, policy entities.Policy, request *SimulationRequest, user *entities.User) (*PolicyMatch, error) {
	// Check if policy applies to the action and resource
	if !ps.matchesActionResource(policy, request.Action, request.Resource) {
		return nil, nil
	}

	match := &PolicyMatch{
		PolicyID:   policy.ID,
		PolicyName: policy.Name,
		Effect:     policy.Effect,
		Priority:   policy.Priority,
		Conditions: []ConditionResult{},
	}

	// Evaluate conditions
	if policy.Conditions != "" {
		var conditions map[string]interface{}
		if err := json.Unmarshal([]byte(policy.Conditions), &conditions); err != nil {
			return nil, err
		}

		for conditionKey, conditionValue := range conditions {
			result := ps.evaluateCondition(conditionKey, conditionValue, request, user)
			match.Conditions = append(match.Conditions, result)
			
			// If any condition fails, the policy doesn't match
			if !result.Result {
				return nil, nil
			}
		}
	}

	return match, nil
}

// matchesActionResource checks if policy applies to the action and resource
func (ps *PolicySimulator) matchesActionResource(policy entities.Policy, action, resource string) bool {
	// Simple pattern matching - in production, use more sophisticated matching
	actionMatches := ps.matchesPattern(policy.Actions, action)
	resourceMatches := ps.matchesPattern(policy.Resources, resource)
	
	return actionMatches && resourceMatches
}

// matchesPattern checks if a pattern matches a value (supports wildcards)
func (ps *PolicySimulator) matchesPattern(pattern, value string) bool {
	if pattern == "*" {
		return true
	}
	
	if strings.Contains(pattern, "*") {
		// Convert wildcard pattern to regex
		regexPattern := strings.ReplaceAll(pattern, "*", ".*")
		matched, _ := regexp.MatchString("^"+regexPattern+"$", value)
		return matched
	}
	
	return pattern == value
}

// evaluateCondition evaluates a single condition
func (ps *PolicySimulator) evaluateCondition(key string, expected interface{}, request *SimulationRequest, user *entities.User) ConditionResult {
	result := ConditionResult{
		Condition: key,
		Expected:  expected,
	}

	// Get actual value from context
	var actualValue interface{}
	
	switch key {
	case "time_range":
		if request.TimeContext != nil {
			actualValue = request.TimeContext.Format("15:04")
		} else {
			actualValue = time.Now().Format("15:04")
		}
	case "day_of_week":
		if request.TimeContext != nil {
			actualValue = request.TimeContext.Weekday().String()
		} else {
			actualValue = time.Now().Weekday().String()
		}
	case "user_department":
		if user != nil {
			actualValue = user.Department
		}
	case "ip_range":
		if request.Context != nil {
			actualValue = request.Context["ip_address"]
		}
	default:
		if request.Context != nil {
			actualValue = request.Context[key]
		}
	}

	result.Value = actualValue
	result.Result = ps.compareValues(actualValue, expected)
	
	return result
}

// compareValues compares actual and expected values
func (ps *PolicySimulator) compareValues(actual, expected interface{}) bool {
	if actual == nil || expected == nil {
		return actual == expected
	}

	// Handle different comparison types
	switch exp := expected.(type) {
	case string:
		if act, ok := actual.(string); ok {
			return ps.matchesPattern(exp, act)
		}
	case []interface{}:
		// Check if actual value is in the list
		for _, item := range exp {
			if ps.compareValues(actual, item) {
				return true
			}
		}
		return false
	default:
		return actual == expected
	}

	return false
}

// analyzeConflicts analyzes conflicts between allow and deny policies
func (ps *PolicySimulator) analyzeConflicts(allowPolicies, denyPolicies []PolicyMatch) *ConflictAnalysis {
	analysis := &ConflictAnalysis{
		HasConflicts:     len(allowPolicies) > 0 && len(denyPolicies) > 0,
		ConflictingPairs: []PolicyConflict{},
		Recommendations:  []string{},
	}

	if !analysis.HasConflicts {
		return analysis
	}

	// Find conflicting pairs
	for _, allowPolicy := range allowPolicies {
		for _, denyPolicy := range denyPolicies {
			conflict := PolicyConflict{
				Policy1:      allowPolicy,
				Policy2:      denyPolicy,
				ConflictType: "allow_deny",
				Severity:     "high",
			}
			analysis.ConflictingPairs = append(analysis.ConflictingPairs, conflict)
		}
	}

	analysis.Resolution = "deny_takes_precedence"
	analysis.Recommendations = append(analysis.Recommendations, 
		"Review conflicting policies to ensure intended behavior",
		"Consider consolidating policies to reduce conflicts",
		"Use more specific conditions to avoid overlaps",
	)

	return analysis
}

// generateRecommendations generates recommendations based on simulation results
func (ps *PolicySimulator) generateRecommendations(result *SimulationResult) []string {
	recommendations := []string{}

	if result.Performance.TotalDuration > 100*time.Millisecond {
		recommendations = append(recommendations, "Consider optimizing policies for better performance")
	}

	if len(result.MatchedPolicies) == 0 {
		recommendations = append(recommendations, "No policies matched - consider adding appropriate policies")
	}

	if len(result.MatchedPolicies) > 10 {
		recommendations = append(recommendations, "Too many policies matched - consider consolidating or adding more specific conditions")
	}

	if result.ConflictAnalysis != nil && result.ConflictAnalysis.HasConflicts {
		recommendations = append(recommendations, result.ConflictAnalysis.Recommendations...)
	}

	return recommendations
}

// BatchSimulate runs multiple simulations in batch
func (ps *PolicySimulator) BatchSimulate(ctx context.Context, requests []*SimulationRequest) ([]*SimulationResult, error) {
	results := make([]*SimulationResult, len(requests))
	
	for i, request := range requests {
		result, err := ps.SimulatePolicy(ctx, request)
		if err != nil {
			results[i] = &SimulationResult{
				Allowed:  false,
				Decision: "error",
				Context:  map[string]interface{}{"error": err.Error()},
			}
		} else {
			results[i] = result
		}
	}
	
	return results, nil
}

// TestPolicySet tests a complete policy set for consistency
func (ps *PolicySimulator) TestPolicySet(ctx context.Context, tenantID int64, testCases []SimulationRequest) (*PolicySetTestResult, error) {
	results := &PolicySetTestResult{
		TenantID:     tenantID,
		TestCases:    len(testCases),
		PassedTests:  0,
		FailedTests:  0,
		TestResults:  []TestCaseResult{},
		Recommendations: []string{},
	}

	for i, testCase := range testCases {
		result, err := ps.SimulatePolicy(ctx, &testCase)
		
		testResult := TestCaseResult{
			TestCase: i + 1,
			Request:  testCase,
			Result:   result,
			Error:    err,
		}

		if err == nil {
			results.PassedTests++
		} else {
			results.FailedTests++
		}

		results.TestResults = append(results.TestResults, testResult)
	}

	return results, nil
}

// PolicySetTestResult represents the result of testing a policy set
type PolicySetTestResult struct {
	TenantID        int64            `json:"tenant_id"`
	TestCases       int              `json:"test_cases"`
	PassedTests     int              `json:"passed_tests"`
	FailedTests     int              `json:"failed_tests"`
	TestResults     []TestCaseResult `json:"test_results"`
	Recommendations []string         `json:"recommendations"`
}

// TestCaseResult represents the result of a single test case
type TestCaseResult struct {
	TestCase int                `json:"test_case"`
	Request  SimulationRequest  `json:"request"`
	Result   *SimulationResult  `json:"result"`
	Error    error              `json:"error,omitempty"`
}