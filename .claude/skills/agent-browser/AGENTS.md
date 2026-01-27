# Agent Browser Skill

Use agent-browser CLI to automate browser testing and verification of web applications.

## When to Use

- Testing UI changes after implementation
- Verifying authentication flows
- Checking form submissions and navigation
- Taking screenshots for documentation
- Validating that pages render correctly

## Prerequisites

Check if agent-browser is installed:

```bash
which agent-browser && agent-browser --version
```

If not installed:

```bash
npm install -g agent-browser
agent-browser install  # Downloads Chromium
```

## Core Commands

### Navigation

```bash
agent-browser open <url>                    # Navigate to URL
agent-browser open http://localhost:3000    # Open local dev server
```

### Page Analysis

```bash
agent-browser snapshot                      # Full accessibility tree
agent-browser snapshot -i                   # Interactive elements only (buttons, inputs, links)
agent-browser snapshot -c                   # Compact view with structure
agent-browser snapshot -d 3                 # Limit depth
```

### Interactions

```bash
agent-browser click @e1                     # Click element by ref
agent-browser fill @e2 "text"               # Clear and fill input
agent-browser type @e2 "text"               # Type without clearing
agent-browser press Enter                   # Press keyboard key
agent-browser scroll down                   # Scroll page
```

### Screenshots

```bash
agent-browser screenshot /path/to/file.png        # Viewport screenshot
agent-browser screenshot --full /path/to/file.png # Full page screenshot
```

### Data Extraction

```bash
agent-browser get text @e1                  # Get element text
agent-browser get html @e1                  # Get element HTML
agent-browser get value @e1                 # Get input value
```

### Session Management

```bash
agent-browser close                         # Close browser
```

## Common Workflows

### Testing a Login Flow

```bash
# 1. Open login page
agent-browser open http://localhost:3002

# 2. Get interactive elements
agent-browser snapshot -i

# 3. Fill credentials and submit
agent-browser fill @e2 "user@example.com"
agent-browser click @e3  # "Continue" button

# 4. Wait and check result
sleep 2
agent-browser snapshot -i

# 5. Take screenshot for verification
agent-browser screenshot /tmp/login-result.png
```

### Testing Form Submission

```bash
# 1. Navigate to form
agent-browser open http://localhost:3000/form

# 2. Get form fields
agent-browser snapshot -i

# 3. Fill form fields
agent-browser fill @e1 "John"
agent-browser fill @e2 "Doe"
agent-browser click @e3  # Dropdown
sleep 1
agent-browser snapshot -i  # Get dropdown options
agent-browser click @e4  # Select option

# 4. Submit
agent-browser click @e10  # Submit button
sleep 2

# 5. Verify result
agent-browser snapshot -c
```

### Testing Multi-Step Wizard

```bash
# Step 1
agent-browser open http://localhost:3002/welcome
agent-browser snapshot -c  # See current step
agent-browser fill @e1 "Value"
agent-browser click @e5  # Next button
sleep 2

# Step 2
agent-browser snapshot -i
agent-browser fill @e1 "Another value"
agent-browser click @e3  # Next
sleep 2

# Final step
agent-browser snapshot -c
agent-browser screenshot /tmp/wizard-complete.png
```

### Handling Dropdowns/Select

```bash
# 1. Click to open dropdown
agent-browser click @e5  # The combobox/select element
sleep 1

# 2. Get options
agent-browser snapshot -i  # Will show listbox and options

# 3. Select option
agent-browser click @e2  # The desired option
```

### OAuth Flow Testing

```bash
# 1. Start OAuth
agent-browser open http://localhost:3002
agent-browser click @e5  # "Sign in with Google"
sleep 3

# 2. On OAuth provider page
agent-browser snapshot -i
agent-browser fill @e2 "email@domain.com"
agent-browser press Enter
sleep 3

# 3. Enter password
agent-browser snapshot -i
agent-browser fill @e1 "password"
agent-browser click @e2  # Next/Sign in
sleep 5

# 4. Handle consent screen if present
agent-browser snapshot -i
agent-browser click @e7  # Allow button
sleep 5

# 5. Verify redirect back to app
agent-browser snapshot -c
```

## Best Practices

1. **Always use `snapshot -i` first** to see available interactive elements and their refs

2. **Add `sleep` after navigation/clicks** to allow page transitions:

   ```bash
   agent-browser click @e1 && sleep 2 && agent-browser snapshot -i
   ```

3. **Chain commands** for efficiency:

   ```bash
   agent-browser fill @e1 "text" && agent-browser click @e2
   ```

4. **Use `-c` (compact) for structure**, `-i` (interactive) for actionable elements

5. **Take screenshots** at key points for visual verification:

   ```bash
   agent-browser screenshot /tmp/step-1.png
   ```

6. **Read screenshots with Read tool** to visually verify:

   ```bash
   agent-browser screenshot /tmp/test.png
   # Then use Read tool to view the image
   ```

7. **Close browser when done**:
   ```bash
   agent-browser close
   ```

## Troubleshooting

### Empty page after action

Wait longer for page load:

```bash
sleep 3
agent-browser snapshot -c
```

Or take screenshot to see actual state:

```bash
agent-browser screenshot /tmp/debug.png
```

### Element not found

Refresh snapshot to get current refs:

```bash
agent-browser snapshot -i
```

### Form not submitting

Try pressing Enter instead of clicking:

```bash
agent-browser press Enter
```

### Dropdown not opening

Some dropdowns need a click, then wait:

```bash
agent-browser click @e3
sleep 1
agent-browser snapshot -i
```

## Reference IDs

Elements are referenced by `@e1`, `@e2`, etc. These refs:

- Are assigned based on DOM order
- Change when page content changes
- Must be refreshed with `snapshot` after navigation

Always run `snapshot -i` before interacting to get current refs.
