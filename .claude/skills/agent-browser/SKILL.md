---
name: agent-browser
description: Automate browser testing with agent-browser CLI. Use when asked to "test the UI", "check if this works", "verify the page", "test the flow", or "take screenshots" of web applications.
metadata:
  author: props.to
  version: "1.0.0"
  argument-hint: <url-or-action>
---

# Agent Browser Testing

Automate browser interactions for testing and verification using the agent-browser CLI tool.

## When to Use

Use this skill when you need to:

- Test UI changes after implementation
- Verify authentication or form flows
- Take screenshots for documentation
- Check that pages render and function correctly
- Validate navigation and user interactions

## Quick Start

1. **Check installation**: `agent-browser --version`
2. **Open a page**: `agent-browser open <url>`
3. **See elements**: `agent-browser snapshot -i`
4. **Interact**: `agent-browser click @e1` or `agent-browser fill @e2 "text"`
5. **Screenshot**: `agent-browser screenshot /tmp/test.png`
6. **Close**: `agent-browser close`

## Full Documentation

See `AGENTS.md` in this directory for complete command reference, workflows, and best practices.

## Example: Test a Login Flow

```bash
agent-browser open http://localhost:3002
agent-browser snapshot -i
agent-browser fill @e2 "user@example.com"
agent-browser click @e3
sleep 2
agent-browser snapshot -i
agent-browser screenshot /tmp/login.png
agent-browser close
```
