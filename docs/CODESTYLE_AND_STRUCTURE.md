## Code Style and Structure

### Naming
- Components: PascalCase (e.g., InfoCard.tsx, DiaryList.tsx)
- Hooks/Utils: camelCase (e.g., useCalendar.ts, dateUtils.ts)
- Assets/Styles: kebab-case (e.g., diary-list.css, empty-state.svg)
- Tests/Stories: OriginalName.test.tsx, OriginalName.stories.tsx

### Foldering
- Feature-first inside apps:
  - components/
  - hooks/
  - lib/
  - ui/ (local-only UI wrappers; prefer SDK)
- Shared UI belongs in `packages/hua-ui`

### SDK-first
- Prefer `@hua-labs/ui` for Buttons, Icons, Cards, Modals, Badges, Toasts, Spinners.
- Propose missing pieces in SDK; avoid re-implementing locally.

### Refactor Order
1) Replace local UI with SDK components (no logic changes)
2) Split oversized components by responsibility
3) Apply route-level code-splitting for heavy pages
4) Enforce filename conventions via ESLint rule

### Sum Diary Split Targets
- DiaryCalendar → CalendarHeader, CalendarGrid, CalendarDayCell, SelectedDayList
- DiaryList → QuestionCard, AnalysisCard, EmptyState, ListItem


