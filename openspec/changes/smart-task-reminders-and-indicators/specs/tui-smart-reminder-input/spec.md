## ADDED Requirements

### Requirement: TUI reminder input supports natural language resolution
The TUI SHALL accept natural language reminder phrases and resolve them to concrete reminder timestamps before reminder creation.

#### Scenario: Resolve relative-time natural language phrase
- **WHEN** a user submits reminder input such as `in ten minutes` for a selected task
- **THEN** the system resolves the phrase to an ISO reminder timestamp
- **AND** creates/updates the task reminder using that resolved timestamp

#### Scenario: Resolve clock-time phrase with rollover semantics
- **WHEN** a user submits reminder input such as `at 6pm`
- **THEN** the system resolves to today at 6:00 PM local time if that time is still in the future
- **AND** resolves to tomorrow at 6:00 PM local time if today 6:00 PM has already passed

### Requirement: TUI reminder input supports due-relative phrases
The TUI SHALL support due-relative reminder phrases that schedule reminders before a task due date.

#### Scenario: Resolve due-relative day offset
- **WHEN** a user submits reminder input such as `1 day before due` on a task that has a due date
- **THEN** the system resolves the reminder timestamp to exactly one day before the task due timestamp
- **AND** creates/updates the reminder with that timestamp

#### Scenario: Resolve due-relative minute offset
- **WHEN** a user submits reminder input such as `30 mins before due` on a task that has a due date
- **THEN** the system resolves the reminder timestamp to exactly thirty minutes before the task due timestamp
- **AND** creates/updates the reminder with that timestamp

#### Scenario: Reject due-relative phrase when task has no due date
- **WHEN** a user submits a due-relative reminder phrase for a task without a due date
- **THEN** the system does not create/update the reminder
- **AND** returns actionable guidance to use an absolute reminder phrase or set a due date first

### Requirement: Reminder parser uses deterministic-first strategy with optional fallback
The reminder resolution pipeline MUST attempt deterministic parsing first and only invoke LLM fallback when deterministic parsing cannot resolve a valid timestamp.

#### Scenario: Deterministic parser success avoids fallback
- **WHEN** deterministic parsing successfully resolves the reminder phrase
- **THEN** the system uses the deterministic result
- **AND** does not invoke LLM fallback

#### Scenario: Deterministic parser failure triggers optional fallback
- **WHEN** deterministic parsing cannot resolve a valid reminder timestamp
- **THEN** the system may invoke LLM fallback to attempt recovery
- **AND** if fallback also fails, the system returns a clear parse error without creating a reminder

### Requirement: Reminder resolution and display use local timezone semantics
The system MUST resolve and present reminder times in the user’s local timezone context.

#### Scenario: Create reminder using local timezone interpretation
- **WHEN** reminder input is parsed into a timestamp
- **THEN** the resolved value reflects local timezone interpretation of user-entered time phrases
- **AND** persisted reminder timestamp corresponds to that local interpretation
