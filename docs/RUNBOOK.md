# Service Availability Runbook

This runbook details the procedures for diagnosing, resolving, and monitoring "Service Unavailable" issues in the Nepal Visuals Trekking application.

## 1. Diagnosis Phase
**Objective:** Identify the root cause of service unavailability.

### Check Application Logs
Inspect the browser console or local development server logs for error messages.
```bash
# View logs from the running dev server
npm run dev
```
**Common Errors:**
- `net::ERR_ABORTED` / `Failed to fetch`: Client-side network blockage (CORS, Ad-blockers).
- `500 Internal Server Error`: Backend Supabase failure.
- `401 Unauthorized`: Missing or invalid API keys.

### Check Connectivity
Verify connection to Supabase:
```bash
curl -I https://sgjmrmslyeecgbdajtwc.supabase.co
```
- **200/404**: Server is reachable (404 is normal for root path).
- **Timeout/Connection Refused**: Network or Firewall issue.

### Check Environment
Ensure environment variables are loaded correctly:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 2. Resolution Phase
**Objective:** Restore service functionality.

### Scenario A: Network/CORS Error (Localhost)
1. **Disable Ad Blockers**: Turn off extensions like uBlock Origin for `localhost`.
2. **Check Supabase Settings**: Ensure your IP or `localhost` port is allowed in Supabase > Authentication > URL Configuration.
3. **Restart Dev Server**:
   ```bash
   # Kill existing processes
   killall node
   # Start fresh
   npm run dev
   ```

### Scenario B: Backend Service Outage
1. **Check Status**: Visit [status.supabase.com](https://status.supabase.com).
2. **Wait for Recovery**: If a major outage is reported, wait for upstream fix.
3. **Contact Support**: If specific to your project, contact Supabase support.

### Scenario C: Configuration Error
1. Verify `.env.local` file exists and has correct values.
2. Re-install dependencies if `node_modules` is suspected corrupt:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 3. Monitoring & Alerting
**Objective:** Proactive detection of issues.

### Health Check System
The application uses a `ServiceMonitor` component (integrated in `App.tsx` via `HealthCheckProvider`) that:
- Pings Supabase every 30 seconds.
- Checks Database and Auth service availability.
- Displays a global alert banner if services are degraded or unavailable.

### Metrics
- **Status**: `healthy` | `degraded` | `unavailable`
- **Response Time**: Threshold < 5000ms.
- **Failures**: Alerts after 3 consecutive failures.

## 4. Verification
**Objective:** Confirm the fix works.

### Automated Tests
Run the health service unit tests:
```bash
npx vitest run lib/services/healthService.test.ts
```

### Manual Verification
1. Open the application in a browser.
2. Ensure the "Service Status" banner is NOT visible (implies Healthy).
3. Open DevTools > Network and verify calls to Supabase return `200 OK`.

## 5. Escalation
If issues persist despite following this runbook:
1. Gather logs (Console + Network HAR file).
2. Document steps taken.
3. Escalate to Senior Engineering or Supabase Support.
