# Claude Code Agent Teams

> Experimental feature (2026-02). Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.
> Already enabled in `.claude/settings.local.json`.

## Concept

Unlike regular subagents (Agent tool), Agent Teams spawn **independent Claude Code instances** that collaborate as a team. Each teammate has its own context window and communicates via SendMessage.

| Component | Role |
|-----------|------|
| Team Lead | Main session. Creates team, assigns work, synthesizes results |
| Teammates | Independent instances. Own context window, full tool access |
| Task List | Shared task list with status, ownership, and dependencies |
| Mailbox | Message exchange via SendMessage. Auto-delivered |

## Usage

### 1. Create Team

```
TeamCreate({ team_name: "dot-migration", description: "dot Phase 2-3 impl" })
```

### 2. Spawn Teammates (Task tool + team_name)

```
TaskCreate({
  team_name: "dot-migration",
  name: "agent-a",
  prompt: "Implement DotProvider + hooks...",
})
```

### 3. Inter-agent Communication (SendMessage)

```
SendMessage({
  team_name: "dot-migration",
  to: "agent-a",           // omit for broadcast
  message: "Notify me when Layer 1 is done"
})
```

### 4. Shutdown & Cleanup

```
SendMessage({ type: "shutdown_request", ... })
TeamDelete({ team_name: "dot-migration" })
```

## Key Rules

- **Teammates don't inherit lead's conversation history** — include full context in spawn prompt
- **Avoid file conflicts** — assign different files to each teammate
- **Sweet spot**: 3-5 teammates, 5-6 tasks per teammate
- **Cost**: Token usage scales linearly with teammate count. Overkill for simple pattern work
- **Plan agent can't use SendMessage** — don't use it in teams

## Display Mode

| Mode | Description |
|------|-------------|
| `in-process` (default) | Main terminal, Shift+Down to cycle teammates |
| `tmux` | Separate pane per teammate. Requires tmux |

Config: `"teammateMode": "in-process"` in settings.json, or CLI `--teammate-mode`

## vs Subagent (Agent tool)

| | Subagent | Agent Team |
|---|---------|------------|
| Context | Within parent session | Independent context window |
| Communication | Returns result only | Bidirectional messaging |
| Cost | Relatively cheap | Scales with teammate count |
| Best for | One-off research, build verification | Parallel implementation, review, exploration |

## Limitations

- No session resumption (`/resume`, `/rewind`) for teammates
- One team per session
- No nested teams (teammates can't create their own teams)
- No lead transfer
- No split pane in Windows Terminal, VS Code integrated terminal
- Task status updates may lag — verify manually

## Project Experience

- **Codemod run** (Session 5): 3 agents processed ~207 files, 0 TS errors, build passed
- **Lesson**: Opus teams are expensive. For pattern work, subagents are better. Teams suit independent tasks requiring judgment
- **Lesson**: Plan agent can't use SendMessage — goes idle. Don't include in teams
