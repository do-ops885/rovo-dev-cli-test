# Workflow Commands Test Scenarios

## workflow init Command

### Test: workflow-init
- **Command**: `rovo-code-flow workflow init`
- **Expected**: 
  - Initializes workflow management system
  - Creates necessary workflow configuration files
  - Shows success message

## workflow templates Command

### Test: workflow-templates
- **Command**: `rovo-code-flow workflow templates`
- **Expected**:
  - Lists available workflow templates
  - Shows template names, descriptions, and phases
  - Requires workflow system to be initialized first

## workflow start Command

### Test: workflow-start
- **Command**: `rovo-code-flow workflow start development`
- **Expected**:
  - Starts a new workflow using the development template
  - Creates workflow tracking files
  - Shows initial phase information
  - Requires workflow system to be initialized first

## workflow status Command

### Test: workflow-status
- **Command**: `rovo-code-flow workflow status`
- **Expected**:
  - Shows current workflow status
  - Displays active phase, progress, and next steps
  - Shows elapsed time and estimated completion
  - Requires an active workflow to be started first

## workflow phases Command

### Test: workflow-phases
- **Command**: `rovo-code-flow workflow phases development`
- **Expected**:
  - Lists all phases in the development workflow template
  - Shows phase names, descriptions, and dependencies
  - Displays estimated duration for each phase

## workflow resume Command

### Test: workflow-resume
- **Command**: `rovo-code-flow workflow resume`
- **Expected**:
  - Resumes a paused workflow
  - Shows current phase and next steps
  - Requires a paused workflow

## workflow complete Command

### Test: workflow-complete
- **Command**: `rovo-code-flow workflow complete current`
- **Expected**:
  - Marks the current phase as complete
  - Advances to the next phase
  - Shows completion message and next phase details

## workflow pause Command

### Test: workflow-pause
- **Command**: `rovo-code-flow workflow pause`
- **Expected**:
  - Pauses the current workflow
  - Saves current state
  - Shows pause confirmation message

## workflow reset Command

### Test: workflow-reset
- **Command**: `rovo-code-flow workflow reset --force`
- **Expected**:
  - Resets the current workflow to initial state
  - Clears progress tracking
  - Shows reset confirmation message