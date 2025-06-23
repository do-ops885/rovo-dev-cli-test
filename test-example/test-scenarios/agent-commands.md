# Agent Commands Test Scenarios

## sparc Command

### Test: sparc-architect
- **Command**: `rovo-code-flow sparc architect "Design a simple authentication system"`
- **Expected**:
  - Validates 'architect' as a valid SPARC mode
  - Uses ACLI integration (since architect agent not implemented)
  - Shows task execution messages

### Test: sparc-coder
- **Command**: `rovo-code-flow sparc coder "Implement a basic user login function"`
- **Expected**:
  - Uses CoderAgent (implemented agent)
  - Shows task execution with coder agent
  - May show artifacts and suggestions

### Test: sparc-tdd
- **Command**: `rovo-code-flow sparc tdd "Write tests for user authentication"`
- **Expected**:
  - Uses ACLI integration for TDD mode
  - Shows task execution messages

### Test: sparc-security
- **Command**: `rovo-code-flow sparc security "Review authentication security"`
- **Expected**:
  - Uses ACLI integration for security mode
  - Shows task execution messages

### Test: sparc-devops
- **Command**: `rovo-code-flow sparc devops "Setup deployment pipeline"`
- **Expected**:
  - Uses ACLI integration for devops mode
  - Shows task execution messages

## event Command

### Test: event-modeler
- **Command**: `rovo-code-flow event modeler "Model user registration flow"`
- **Expected**:
  - Uses ModelerAgent (implemented agent)
  - Shows task execution with modeler agent
  - May show artifacts and suggestions

### Test: event-timeline
- **Command**: `rovo-code-flow event timeline "Create timeline for user onboarding"`
- **Expected**:
  - Uses ACLI integration for timeline role
  - Shows task execution messages

### Test: event-ui
- **Command**: `rovo-code-flow event ui "Map user interface for registration"`
- **Expected**:
  - Uses ACLI integration for UI role
  - Shows task execution messages

### Test: event-state
- **Command**: `rovo-code-flow event state "Model user state transitions"`
- **Expected**:
  - Uses ACLI integration for state role
  - Shows task execution messages

### Test: event-mapper
- **Command**: `rovo-code-flow event mapper "Map system components"`
- **Expected**:
  - Uses ACLI integration for mapper role
  - Shows task execution messages

## agent Command

### Test: agent-spawn-coder
- **Command**: `rovo-code-flow agent spawn test-coder`
- **Expected**:
  - Creates and initializes a CoderAgent
  - Registers agent with orchestrator
  - Shows agent details (ID, type, capabilities)

### Test: agent-list
- **Command**: `rovo-code-flow agent list`
- **Expected**:
  - Lists all active agents
  - Shows agent details for each

### Test: agent-kill
- **Command**: `rovo-code-flow agent kill test-coder`
- **Expected**:
  - Terminates the specified agent
  - Unregisters from orchestrator
  - Shows termination confirmation

## swarm Command

### Test: swarm-development
- **Command**: `rovo-code-flow swarm "Implement a complete user management system" --strategy development --max-agents 2`
- **Expected**:
  - Creates agents based on development strategy
  - Uses sequential execution (default)
  - Shows coordination results

### Test: swarm-parallel
- **Command**: `rovo-code-flow swarm "Create API endpoints for user operations" --parallel --strategy implementation --max-agents 3`
- **Expected**:
  - Creates agents based on implementation strategy
  - Uses parallel execution
  - Shows coordination results