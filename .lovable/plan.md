## Plan: 5 Functional Features + Supabase Integration

Keeping existing pink/lavender theme intact. Adding features with toasts (sonner) + console logs for verification.

### 1. Database Changes (Migration)

Two new tables needed:

**`staff` table** — Warden-managed hostel staff directory
- Fields: `name`, `role`, `timing`
- RLS: SELECT for any authenticated user; INSERT/UPDATE/DELETE for warden only

**`payments` table** — Student fee ledger
- Fields: `student_id`, `description`, `amount`, `due_date`, `status` ('Paid' | 'Unpaid'), `paid_at`
- RLS: students see own; warden sees/manages all

**`profiles.inventory_verified`** column (boolean, default false) — for onboarding gate

(Note: `billing_records` already exists but a separate `payments` ledger is requested explicitly. Will create as asked.)

### 2. Frontend Features

**A. Staff Directory (Warden Dashboard)**
- New section/tab "Staff Directory" inside `WardenDashboard.tsx`
- Form: Name / Role / Timing → INSERT into `staff`
- List refreshes immediately after insert
- Toast: "Staff Added Successfully" / error toast on failure
- `console.log` on submit + response

**B. Emergency Contact (Student Dashboard)**
- "Contact Warden" button → uses warden phone from hostel info memory
- Two actions: `tel:` link + WhatsApp `https://wa.me/...` link
- Toast confirms action triggered, console logs the URL

**C. Conditional Status Badges (Gate Pass / Leave Requests)**
- Update leave/gate pass list rendering on both sides
- Badge color reads from DB `status` field: Pending=amber, Approved=green, Rejected=red
- After warden clicks Approve/Reject: optimistic update + refetch so student & warden views reflect immediately
- Toast on each action, console log status change

**D. Inventory Verification Gate (Student Onboarding)**
- On `StudentDashboard` mount: check `profile.inventory_verified`
- If `false` → render full-screen modal asset checklist (Bed, Mattress, Pillow, Cupboard, Chair, Desk, Fan, Lights)
- Submit → UPDATE `profiles.inventory_verified = true` → unlock dashboard
- Toast on success + console log

**E. Fee Status Ledger (Student Dashboard)**
- New "Fee Ledger" card fetches from `payments` table
- Each row: description + amount + colored status pill (green=Paid, red=Unpaid)
- Console log fetched data; toast on fetch error

### 3. Verification

- Each Supabase call wrapped: `console.log('[feature] response', { data, error, status })`
- Sonner toasts for both success + error paths
- After implementation, I'll open the preview and confirm console + network show 200/201 responses

### Files to touch
- `supabase/migrations/...` (new tables + column via migration tool)
- `src/pages/WardenDashboard.tsx` (Staff Directory + badge color logic)
- `src/pages/StudentDashboard.tsx` (Contact Warden, Inventory gate, Fee Ledger, badge colors)
- Possibly small new components under `src/components/dashboard/`

### Order of execution
1. Run migration (create `staff`, `payments`, add `inventory_verified` column) — wait for approval
2. After approval: implement frontend changes in one pass
3. Verify in preview (console + network)
