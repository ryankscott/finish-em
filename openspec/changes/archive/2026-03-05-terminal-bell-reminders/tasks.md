## 1. API for due reminders

- [x] 1.1 Add `listDueReminders: () => Promise<Reminder[]>` to `ApiClient` in `src/tui/api-client.ts`
- [x] 1.2 Implement `listDueReminders` in `src/tui/direct-api.ts` by calling `reminderRepo.listDueReminders()`

## 2. Polling and “already notified” state

- [x] 2.1 Add a hook (e.g. `useReminderBell`) that polls `api.listDueReminders()` on a fixed interval (e.g. 60s)
- [x] 2.2 In the hook, maintain a set of reminder IDs (or a stable key per reminder) that have already triggered the bell this session
- [x] 2.3 On each poll, compute newly due reminders (in API result but not in the set), then add them to the set after notifying

## 3. Bell and optional toast

- [x] 3.1 For each newly due reminder, write the terminal bell (`\x07`) to stdout (or the app’s stdout handle)
- [x] 3.2 Optionally push a toast per newly due reminder (e.g. “Reminder: <task title>”) using the existing toast API
- [x] 3.3 Wire the hook into `App.tsx` (or the root component that has access to `api` and `pushToast`)

## 4. Tests

- [x] 4.1 Unit test the hook (or core logic): given a list of due reminders and an “already notified” set, only newly due ones trigger bell and get added to the set
- [x] 4.2 Integration or unit test that `listDueReminders` is called on the API when the TUI runs (or that the hook invokes the provided API)
