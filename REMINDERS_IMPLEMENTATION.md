# Reminder Feature Implementation

## Overview

Implemented a Todoist-like reminder system for tasks with natural language time input support and "Before task" reminders.

## Components Added

### 1. ReminderModal (`src/components/tasks/ReminderModal.tsx`)

A dialog modal for adding reminders to tasks with:

- **Two tabs**: 
  - **"Date & time"**: Set reminders for specific times with natural language parsing
  - **"Before task"**: Set reminders relative to the task's due date (only enabled when task has a due date with specific time)
- **Natural language time parsing** that supports:
  - Simple times: `9am`, `18:00`, `3pm`, `9:30am`
  - Day-specific times: `Mon 18:00`, `Tue 7pm`
  - Relative dates: `today`, `tomorrow`
  - Full day names: `Monday 9am`, `Tuesday 18:00`
- **Before task reminders**:
  - Enter minutes before due date (e.g., `30` for 30 minutes before)
  - Only available when task has a due date with specific time (not midnight)
  - Validates that reminder time is not in the past
- **Validation**: Shows error messages for invalid time formats
- **User-friendly**: Displays examples and accepts Enter key for submission

### 2. Updated Task Component (`src/components/tasks/Task.tsx`)

Modified to display reminders in a Todoist-like format:

- **Reminders section** with light gray background
- **Bell icon** for each reminder
- **Human-readable dates**: "Today 16:00", "Tomorrow 9am", etc.
- **Add button** (+) to open the reminder modal
- **Remove button** for each reminder
- **Support for multiple reminders** per task

### 3. Updated TaskList Component (`src/components/tasks/TaskList.tsx`)

- Manages reminder state for all tasks
- Opens/closes the reminder modal
- Passes task's due date to modal to enable/disable "Before task" feature
- Handles adding and deleting reminders
- Maintains synchronization with the backend

## Features

### Natural Language Time Parsing

The parser supports multiple input formats:

```
9am              → Next 9:00 AM
18:00            → Next 6:00 PM  
9:30am           → Next 9:30 AM
Mon 18:00        → Next Monday at 6:00 PM
Tue 7pm          → Next Tuesday at 7:00 PM
tomorrow         → Tomorrow at 9:00 AM
today            → Today at 9:00 AM (or tomorrow if passed)
```

**Validation rules**:
- Hours: 0-23 for 24-hour format, 1-12 for 12-hour format
- Minutes: 0-59
- Invalid inputs return `null` with helpful error messages

### Before Task Reminders

Set reminders relative to the task's due date:

- **Input**: Number of minutes before the due date
- **Examples**: `30` (30 minutes before), `60` (1 hour before), `120` (2 hours before)
- **Requirements**:
  - Task must have a due date
  - Due date must include a specific time (not just midnight/00:00)
  - Calculated reminder time must not be in the past
- **Calculation**: `reminderTime = dueDate - (minutes * 60 * 1000)`
- **Validation**: Checks if reminder would be in the past and shows error

### UI/UX Improvements

- **Consistent styling** with the rest of the app using shadcn/ui components
- **Clear visual hierarchy** with bell icons and formatted dates
- **Conditional tab enabling**: "Before task" tab disabled when not applicable
- **Error handling** with user-friendly messages
- **Keyboard support** (Enter to submit)
- **Loading states** during submission

## Tests

Created comprehensive unit tests:

### `parseTimeInput.test.ts` (15 tests, all passing ✓)

Tests for the natural language time parser covering:
- Invalid input handling
- 12-hour and 24-hour formats
- Time with minutes
- AM/PM handling including edge cases (12am, 12pm)
- Day names (short and full)
- Relative dates (today, tomorrow)
- Case insensitivity
- Whitespace handling

### `beforeTaskReminder.test.ts` (9 tests, all passing ✓)

Tests for the "Before task" functionality:
- `hasTime()` function validation
- Reminder time calculations for various durations
- Cross-day boundary handling
- Detection of past reminder times

### `ReminderModal.test.tsx` (12 tests)

Tests for the modal component including:
- Rendering and visibility
- Tab enabling/disabling based on due date
- Form validation and error handling
- Submission and API integration

## Technical Details

### API Integration

Uses existing API endpoints:
- `GET /api/tasks/:taskId/reminders` - List reminders
- `POST /api/tasks/:taskId/reminders` - Create reminder
- `DELETE /api/reminders/:reminderId` - Delete reminder

### State Management

- Local state for modal open/close
- Reminder data fetched on mount and after updates
- Optimistic UI updates for better UX
- Task due date passed to modal for "Before task" validation

### Dependencies Added

- `@radix-ui/react-tabs` (via shadcn tabs component)
- Used existing: dialog, button, input, badge components

## Files Modified

- ✅ `src/components/tasks/Task.tsx`
- ✅ `src/components/tasks/TaskList.tsx`
- ✅ `src/components/tasks/Task.test.tsx` (updated props)
- ✅ `src/components/tasks/ReminderModal.tsx` (added "Before task" feature)
- ✅ `src/components/tasks/ReminderModal.test.tsx` (added new tests)

## Files Created

- ✅ `src/components/tasks/ReminderModal.tsx`
- ✅ `src/components/tasks/ReminderModal.test.tsx`
- ✅ `src/components/tasks/parseTimeInput.test.ts`
- ✅ `src/components/tasks/beforeTaskReminder.test.ts`

## Future Enhancements

1. **Recurring reminders**: Support for repeated reminders
2. **Snooze functionality**: Allow snoozing reminders (API exists, UI not implemented)
3. **Notification system**: Browser notifications when reminders fire
4. **Relative time display**: "in 2 hours", "in 3 days"
5. **More formats**: Support for formats like "in 30 minutes", "next Friday"
6. **Custom time offsets**: Quick buttons for common offsets (15min, 1hr, 1day)

## Implementation Notes

### Due Date Time Detection

The `hasTime()` function checks if a due date has a specific time by verifying that the UTC hours and minutes are not both zero. This ensures:
- Dates at midnight (00:00 UTC) are treated as "date only"
- Any other time is considered a "date with time"
- The "Before task" tab is only enabled for dates with specific times

### Timezone Handling

- All dates are stored and processed in ISO 8601 format (UTC)
- The `hasTime()` function uses UTC hours/minutes for consistency
- Reminder calculations preserve timezone information
- Display formatting uses local time for user-friendly display
