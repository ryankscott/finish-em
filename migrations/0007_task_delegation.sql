-- A task handed to an AI agent (Claude, ChatGPT, Codex) from the task editor.
-- delegate_status is 'delegated' while the agent works and 'review' once it
-- reports back; NULL means the task is not delegated. delegate_agent records
-- which agent got it, so a "send back" goes to the same place.
ALTER TABLE tasks ADD COLUMN delegate_status TEXT;
ALTER TABLE tasks ADD COLUMN delegate_agent TEXT;
