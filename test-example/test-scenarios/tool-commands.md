# Tool Commands Test Scenarios

## acli Command

### Test: acli-install
- **Command**: `rovo-code-flow acli install`
- **Expected**:
  - Checks if ACLI is installed
  - If not installed, shows installation instructions
  - If installed, initializes Rovo Dev configuration
  - Shows next steps for authentication

### Test: acli-run-instruction
- **Command**: `rovo-code-flow acli run --instruction "Show me the current project structure"`
- **Expected**:
  - Runs ACLI with the specified instruction
  - Uses non-interactive mode
  - Shows execution results

## Additional ACLI Tests (Interactive)

These tests would require user interaction and are better suited for manual testing:

### acli-auth
- **Command**: `rovo-code-flow acli auth`
- **Expected**:
  - Starts authentication process
  - Prompts for API token
  - Guides through authentication steps

### acli-setup
- **Command**: `rovo-code-flow acli setup`
- **Expected**:
  - Combines install and auth steps
  - Complete setup process
  - Ready-to-use configuration

### acli-run-interactive
- **Command**: `rovo-code-flow acli run --interactive`
- **Expected**:
  - Starts interactive ACLI session
  - Allows natural language commands
  - Continuous interaction until exit