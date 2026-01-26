# Service Availability Resolution Plan

I have analyzed the current system and identified gaps in monitoring integration, test reliability, and documentation. Here is the plan to resolve the "service unavailable" issue comprehensively:

## 1. Fix Health Service Tests
**Problem:** The unit tests in `lib/services/healthService.test.ts` are failing because the Supabase mocks are not correctly propagating return values, causing false positives/negatives.
**Action:**
- Refactor the test file to correctly mock `supabase-js` client methods.
- Ensure failure scenarios (database down, auth down, network error) are accurately simulated and verified.

## 2. Integrate Global Health Monitoring
**Problem:** The `HealthCheckProvider` exists but is not used in the application root, rendering the monitoring system inactive.
**Action:**
- Modify `index.tsx` to wrap the `<App />` component with `<HealthCheckProvider>`.
- This ensures `ServiceMonitor` runs globally to detect and report issues.

## 3. Enhance Health Check Logic
**Problem:** The current `healthCheck` function in `lib/supabaseClient.ts` catches network errors but provides generic messages.
**Action:**
- Update `healthCheck` to detect specific "Failed to fetch" / "ERR_ABORTED" errors.
- Add the same "Check CORS/Ad-blocker" hint logic implemented in `errorUtils.ts` to guide developers/users during local development issues.

## 4. Create Service Runbook
**Problem:** No centralized guide exists for diagnosing and resolving service issues as requested.
**Action:**
- Create `docs/RUNBOOK.md` following the user's 5-step structure.
- Include specific commands for checking logs, running tests, and interpreting health dashboard metrics.

## 5. Verification
- Run the fixed `healthService.test.ts` to confirm logic correctness.
- (Manual) Verify the application builds and runs with the new provider integration.
