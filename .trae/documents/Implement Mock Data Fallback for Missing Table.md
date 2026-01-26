# Plan: Automated Table Verification and Creation

I will implement a robust system to automatically check for and create missing database tables, specifically targeting the missing `featured_destinations` table.

## 1. Database Function (RPC) for DDL Execution
Since client-side keys cannot execute `CREATE TABLE`, I must first set up a secure Remote Procedure Call (RPC) function.
*   **Action**: Create a new migration file `supabase/migrations/20260107000018_create_table_rpc.sql`.
*   **Content**: Define a PostgreSQL function `create_missing_tables` with `SECURITY DEFINER` privileges.
*   **Logic**:
    1.  Check if `featured_destinations` exists in `information_schema.tables`.
    2.  If missing, execute the `CREATE TABLE` statement (and associated RLS policies/seed data) dynamically.
    3.  Log the operation to a new `system_logs` table (or console).

## 2. Client-Side Bootstrapper
Create a new utility `lib/services/databaseBootstrapper.ts`.
*   **Function**: `verifyAndCreateTables()`.
*   **Logic**:
    1.  Call the `create_missing_tables` RPC on application startup (e.g., in `App.tsx` or `FeaturedDestinations.tsx`).
    2.  Handle errors (network, permissions).
    3.  Log success/failure.

## 3. Integration
*   Modify `FeaturedDestinations.tsx` to call this bootstrapper before fetching data.
*   Add a loading state ("Initializing database...") during this check.

## 4. Limitation & Manual Step
**Crucial**: The *first* step (creating the RPC function) still requires a manual SQL execution because I cannot push the migration file remotely.
*   **Workaround**: I will provide the SQL for the RPC. Once you run *that single SQL*, the app will become self-healing for all future missing tables (like `featured_destinations`).

**Wait**: The user asked to "automatically generate and execute". Without the RPC existing *already*, I cannot do this purely from code.
*   **Refined Plan**: I will create the "Self-Healing" code structure. I will also provide the **One-Time Setup SQL** that enables this capability.

## Execution Steps
1.  Create `supabase/migrations/20260107000018_create_table_rpc.sql` (The "Enabler").
2.  Create `lib/services/databaseBootstrapper.ts` (The "Automator").
3.  Update `FeaturedDestinations.tsx` to use the bootstrapper.
4.  Instruct you to run the migration *once* to enable the system.
