# Core Commands Test Scenarios

## init Command

### Test: init-sparc
- **Command**: `rovo-code-flow init --sparc`
- **Expected**: 
  - Creates `.sparc` directory
  - Creates subdirectories for each SPARC mode (architect, coder, tdd, security, devops)
  - Creates `.sparc/README.md` with usage instructions
  - Initializes memory files
  - Sets up ACLI integration

### Test: init-event
- **Command**: `rovo-code-flow init --event`
- **Expected**:
  - Creates `.event-modeling` directory
  - Creates subdirectories for each role (modeler, timeline, ui, state, mapper)
  - Creates `.event-modeling/README.md` with usage instructions
  - Initializes memory files
  - Sets up ACLI integration

### Test: init-both
- **Command**: `rovo-code-flow init --sparc --event`
- **Expected**:
  - Creates both `.sparc` and `.event-modeling` directories
  - All subdirectories and README files created
  - Configuration updated for both modes

## start Command

### Test: start-basic
- **Command**: `rovo-code-flow start`
- **Expected**:
  - Starts the orchestrator
  - Shows startup messages
  - Runs for a few seconds then terminates (in test)

### Test: start-ui
- **Command**: `rovo-code-flow start --ui --port 3001`
- **Expected**:
  - Starts orchestrator with UI
  - Uses port 3001 instead of default 3000
  - Shows UI startup messages

## interactive Command

### Test: interactive-with-prompt
- **Command**: `rovo-code-flow interactive --prompt "Hello, this is a test prompt"`
- **Expected**:
  - Starts interactive mode
  - Processes initial prompt
  - Shows interactive prompt
  - Accepts `/exit` command to terminate