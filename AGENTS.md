# Agent Development Guidelines

This document outlines the key architectural decisions and conventions for the Finish-Em project.

## UI Components

- **Use shadcn/ui**: All UI components should use shadcn/ui components. Follow the shadcn/ui patterns and conventions for consistent styling and behavior.

- **Use lucide-react for icons**: All icons should use lucide-react. Never use emojis or custom SVGs for icons. This ensures:
  - Consistent icon styling across the app
  - Easy theming and customization
  - Accessible icon components
  - Large library of well-designed icons

## API & Backend

- **Always add an API**: All features should be implemented with a proper API layer. Never bypass the API to directly manipulate data from the frontend.

- **Use OpenAPI spec**: All API functionality must be defined using the OpenAPI specification. This ensures:
  - Type safety between frontend and backend
  - Auto-generated documentation
  - Consistent API contracts
  - Easy integration testing

## Code Style

- **Prefer functional code**: Use functional programming patterns wherever possible:
  - Pure functions
  - Immutability
  - Function composition
  - Avoid classes unless absolutely necessary

## State Management

- **react-query for server state**: Use TanStack Query (react-query) for all server state management:
  - Data fetching
  - Caching
  - Background updates
  - Optimistic updates

- **useContext for local state**: Use React Context (via `useContext`) for local/UI state that needs to be shared across components:
  - UI preferences
  - Modal states
  - Local form state
  - Theme/appearance settings

## Date & Time

- **Use date-fns for all date operations**: Never use manual `Date` manipulation (e.g., `setDate`, `setHours`, `getFullYear`, `getMonth`). Always use date-fns functions instead:
  - `startOfDay`, `endOfDay`, `startOfWeek` for day boundaries
  - `addDays`, `addMonths`, `addYears`, `addMinutes`, `subMinutes` for arithmetic
  - `format` for formatting dates
  - `parseISO`, `isValid` for parsing
  - `isSameDay`, `isToday`, `isTomorrow`, `isBefore`, `isAfter`, `isPast` for comparisons
  - `set`, `setHours`, `setMinutes` for setting specific fields
  - `differenceInDays`, `differenceInMinutes` for differences

## Architecture Summary

```
Frontend (React)
  ├── Components (shadcn/ui)
  ├── Local State (useContext)
  └── Server State (react-query)
       ↓
    API Layer (OpenAPI spec)
       ↓
    Backend Services
       ↓
    Database
```
