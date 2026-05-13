# Recurring Tasks — Design Spec

## Overview

Users need periodic tasks (monthly, quarterly, semi-annual, annual). On completion or expiry, the task's due date shifts to the next cycle. A dedicated panel on the home page warns of upcoming recurrences.

## Data Model

### `tasks` table — new columns

| Column | Type | Description |
|--------|------|-------------|
| `recurrence_type` | `varchar` | `null` = one-shot; `'monthly'`, `'quarterly'`, `'semi_annual'`, `'annual'` |
| `next_due_date` | `timestamptz` | Current-cycle due date. For one-shot tasks this equals the original `due_date`. |
| `recurrence_start` | `timestamptz` | Anchor date for the recurrence cycle. |

### `task_completion_history` — new table

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid PK default gen_random_uuid()` | Primary key |
| `task_id` | `uuid FK → tasks.id ON DELETE CASCADE` | Owning task |
| `completed_date` | `timestamptz` | When the cycle was closed |
| `type` | `varchar` | `'manual'` (user clicked complete) or `'auto'` (past-due auto-reset) |
| `created_at` | `timestamptz default now()` | Row creation time |

## Reminder Window (frontend constant)

| Recurrence | Days before `next_due_date` |
|------------|-----------------------------|
| monthly | 3 |
| quarterly | 7 |
| semi_annual | 10 |
| annual | 15 |

## Cycle Logic

### Due-date advancement

On completion or auto-reset, `next_due_date` = `next_due_date` + interval:

| Type | Interval |
|------|----------|
| monthly | +1 month |
| quarterly | +3 months |
| semi_annual | +6 months |
| annual | +12 months |

Use `date-fns/addMonths`.

### Auto-reset (pg_cron, daily at 2am)

1. SELECT tasks where `recurrence_type IS NOT NULL AND next_due_date <= now()`
2. For each: INSERT `task_completion_history` (type=`auto`) → advance `next_due_date` → set `status='todo'`
3. If the task has subtasks, reset those as well.

**Fallback:** If pg_cron is unavailable (free plan), use Netlify scheduled function to call `POST /api/cron/reset-recurring-tasks`.

### Manual completion

User clicks "Complete" in `TaskDrawer` → INSERT history (type=`manual`) → advance `next_due_date` → reset status.

## UI Changes

### 1. QuickAdd & TaskEditDialog — recurrence selector

- Toggle button group: "One-shot" / "Recurring"
- When "Recurring" is selected: dropdown for type (monthly / quarterly / semi-annual / annual)
- Helper text shows the reminder window, e.g. "Reminded 3 days before due date"
- Compact layout, sits below the description field

### 2. Home page — RecurringReminder panel

- New component inserted between `TodaySummary` and `UpcomingDeadlines`
- Lists recurring tasks where `now() >= next_due_date - reminder_days AND now() < next_due_date`
- Each row: task name + type badge + "X days left" (red if ≤1) + due date
- Click navigates to board or opens task drawer
- Empty state: "No upcoming recurring tasks"

### 3. TaskDrawer — cycle info + completion history

If task has `recurrence_type`:
- Show recurrence badge + next due date
- Completion history timeline (last 10 entries):
  - ✓ `completed_date` — manual
  - ⟳ `completed_date` — auto

One-shot tasks show none of this.

## Implementation Order

1. **Database migration** — ALTER tasks + CREATE history table + pg_cron job
2. **TypeScript types** — update `Task` type, add `CompletionHistoryEntry`
3. **Data hooks** — `useRecurringTaskHistory`, update `useTasks`
4. **Recurrence selector** — `QuickAdd` + `TaskEditDialog`
5. **Complete logic** — server action to complete-and-advance
6. **Completion history** — timeline in `TaskDrawer`
7. **RecurringReminder panel** — new component, wired to home page
