---
name: Bug
about: Report technical issues
title: ""
labels: type:bug
assignees: ""
body:
  - type: dropdown
    id: severity
    attributes:
      label: What is the severity of this bug?
      options:
        - Critical (blocking)
        - High (functional)
        - Medium (partial)
        - Low (cosmetic)
    validations:
      required: true
---

## Reproduction Path

1. Environment: [OS/Browser]
2. Trigger: [Specific action]
3. Error: [Observed behavior]

## Expected Behavior

[Correct system response]

## Diagnostic Evidence

```json
{ "error": "Include relevant logs" }
```

## Evidence

[Loom video](https://www.loom.com/) | [BirdEatsBug](https://birdeatsbug.com/) report | Other tools
