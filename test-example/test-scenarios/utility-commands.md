# Utility Commands Test Scenarios

## usage Command

### Test: usage
- **Command**: `rovo-code-flow usage`
- **Expected**:
  - Shows daily token usage statistics
  - Displays usage metrics
  - No errors in execution

## sessions Command

### Test: sessions-list
- **Command**: `rovo-code-flow sessions --list`
- **Expected**:
  - Lists all available sessions
  - Shows session details and status
  - May show empty list if no sessions exist

### Test: sessions-clear
- **Command**: `rovo-code-flow sessions --clear`
- **Expected**:
  - Clears current session message history
  - Shows confirmation message
  - Session remains but history is cleared

### Test: sessions-prune
- **Command**: `rovo-code-flow sessions --prune`
- **Expected**:
  - Reduces token size of current session
  - Retains context while reducing size
  - Shows pruning results

## instructions Command

### Test: instructions-list
- **Command**: `rovo-code-flow instructions --list`
- **Expected**:
  - Lists all saved instructions
  - Shows instruction details
  - May show empty list if no instructions saved

## Additional Instructions Tests (Interactive)

These tests would require user interaction:

### instructions-add
- **Command**: `rovo-code-flow instructions --add`
- **Expected**:
  - Prompts for new instruction
  - Saves instruction to storage
  - Shows confirmation

### instructions-remove
- **Command**: `rovo-code-flow instructions --remove 1`
- **Expected**:
  - Removes instruction by index
  - Shows confirmation
  - Updates instruction list

### instructions-run
- **Command**: `rovo-code-flow instructions --run 1`
- **Expected**:
  - Executes saved instruction
  - Shows execution results
  - Same as running instruction directly

## feedback Command

### Test: feedback-bug
- **Command**: `rovo-code-flow feedback --bug`
- **Expected**:
  - Starts bug report process
  - Prompts for bug details (in test, we send 'n' to skip)
  - Shows feedback submission options

### Test: feedback-feature
- **Command**: `rovo-code-flow feedback --feature`
- **Expected**:
  - Starts feature request process
  - Prompts for feature details (in test, we send 'n' to skip)
  - Shows feedback submission options