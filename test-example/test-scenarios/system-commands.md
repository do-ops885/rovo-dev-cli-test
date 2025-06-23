# System Commands Test Scenarios

## status Command

### Test: status
- **Command**: `rovo-code-flow status`
- **Expected**:
  - Shows system health information
  - Displays metrics and status
  - No errors in execution

## memory Command

### Test: memory-init
- **Command**: `rovo-code-flow memory init`
- **Expected**:
  - Initializes memory files
  - Creates `.agent.md` and `.agent.local.md` files
  - Adds repository information to memory

### Test: memory-add-local
- **Command**: `rovo-code-flow memory add "This is a test note for local memory"`
- **Expected**:
  - Adds note to local memory file (`.agent.local.md`)
  - Shows confirmation message

### Test: memory-add-global
- **Command**: `rovo-code-flow memory add "This is a test note for global memory" --global`
- **Expected**:
  - Adds note to global memory file (`~/.agent.md`)
  - Shows confirmation message

### Test: memory-add-repo
- **Command**: `rovo-code-flow memory add "This is a test note for repo memory" --repo`
- **Expected**:
  - Adds note to repository memory file (`./.agent.md`)
  - Shows confirmation message

### Test: memory-list-local
- **Command**: `rovo-code-flow memory list`
- **Expected**:
  - Shows contents of local memory file
  - Displays previously added notes

### Test: memory-list-global
- **Command**: `rovo-code-flow memory list --global`
- **Expected**:
  - Shows contents of global memory file
  - Displays previously added notes

### Test: memory-remove
- **Command**: `rovo-code-flow memory remove "test note"`
- **Expected**:
  - Removes matching notes from memory
  - Shows confirmation message

## mcp Command

### Test: mcp-list
- **Command**: `rovo-code-flow mcp list`
- **Expected**:
  - Lists all configured MCP servers
  - Shows server status and details
  - May show empty list if no servers configured