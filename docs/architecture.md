# Architecture

The goal of this document is to outline high level architecture for this project.

## Goals

- Mobile first. This has to be usable & accessible across devices to ensure
  capturing tasks is as easy as possible, and the desktop/web apps make
  navigating your tasks / projects as easy as possible.
- Collect useful data early, and iterate. The `org-mode` spec is huge, and from
  Doist to Atlassian and everything in between, the task management market is
  saturated. We should start small, run experiments, and iterate. 
- Should be a small tech stack. Given that it's a small team and not a complex
  problem space, we should pick a small & battle-tested tech stack that allows
  us to move quick. Ideally full stack TypeScript (React + GraphQL + React
  Native + Electron), but Dart + Flutter + GraphQL might be interesting too. Use
  as much 3rd party solutions we can and focus on plumbing.
