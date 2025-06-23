# Rovo Code Flow CLI Examples

This document provides practical examples of using the rovo-code-flow CLI with all available commands and parameters.

## Setup and Initialization

### Initialize Project with SPARC
```bash
rovo-code-flow init --sparc
```
Creates `.sparc` directory with subdirectories for each mode and initializes configuration.

### Initialize Project with Event Modeling
```bash
rovo-code-flow init --event
```
Creates `.event-modeling` directory with role-specific subdirectories.

### Initialize with Both Methodologies
```bash
rovo-code-flow init --sparc --event
```
Sets up both SPARC and Event Modeling in the same project.

## Core Operations

### Start Orchestrator
```bash
# Basic startup
rovo-code-flow start

# Start with UI on custom port
rovo-code-flow start --ui --port 3001
```

### Interactive Mode
```bash
# Start interactive mode
rovo-code-flow interactive

# Start with initial prompt
rovo-code-flow interactive --prompt "Help me design a user authentication system"
```

## SPARC Methodology

### Architecture Design
```bash
rovo-code-flow sparc architect "Design a microservices architecture for an e-commerce platform"
```

### Code Implementation
```bash
rovo-code-flow sparc coder "Implement a REST API for user management with Express.js"
```

### Test-Driven Development
```bash
rovo-code-flow sparc tdd "Write comprehensive tests for the authentication module"
```

### Security Analysis
```bash
rovo-code-flow sparc security "Perform security review of the payment processing system"
```

### DevOps and Deployment
```bash
rovo-code-flow sparc devops "Create CI/CD pipeline for automated deployment to AWS"
```

## Event Modeling

### Core Event Modeling
```bash
rovo-code-flow event modeler "Model the complete order fulfillment process"
```

### Timeline Planning
```bash
rovo-code-flow event timeline "Create timeline for user onboarding journey"
```

### UI/UX Mapping
```bash
rovo-code-flow event ui "Map user interface flows for the checkout process"
```

### State Modeling
```bash
rovo-code-flow event state "Model state transitions for order processing"
```

### System Mapping
```bash
rovo-code-flow event mapper "Map integration points between microservices"
```

## Agent Management

### Spawn Agents
```bash
# Spawn a coder agent
rovo-code-flow agent spawn my-coder

# Spawn a modeler agent
rovo-code-flow agent spawn event-modeler
```

### List Active Agents
```bash
rovo-code-flow agent list
```

### Terminate Agents
```bash
rovo-code-flow agent kill my-coder
```

## Multi-Agent Swarms

### Development Strategy (Sequential)
```bash
rovo-code-flow swarm "Build a complete user authentication system" --strategy development --max-agents 2
```

### Implementation Strategy (Parallel)
```bash
rovo-code-flow swarm "Create CRUD operations for all entities" --parallel --strategy implementation --max-agents 3
```

### Design Strategy
```bash
rovo-code-flow swarm "Design and model the entire system architecture" --strategy design --max-agents 2
```

## Memory Management

### Initialize Memory
```bash
rovo-code-flow memory init
```

### Add Notes
```bash
# Add to local memory
rovo-code-flow memory add "Remember to use TypeScript for all new components"

# Add to global memory
rovo-code-flow memory add "Always follow the company coding standards" --global

# Add to repository memory
rovo-code-flow memory add "This project uses React 18 with Vite" --repo
```

### View Memory Contents
```bash
# View local memory
rovo-code-flow memory list

# View global memory
rovo-code-flow memory list --global

# View repository memory
rovo-code-flow memory list --repo
```

### Remove Notes
```bash
rovo-code-flow memory remove "TypeScript"
```

## System Management

### Check System Status
```bash
rovo-code-flow status
```

### MCP Server Management
```bash
# List MCP servers
rovo-code-flow mcp list

# Start an MCP server
rovo-code-flow mcp start --start server-name

# Stop an MCP server
rovo-code-flow mcp stop --stop server-name
```

## Atlassian CLI Integration

### Setup ACLI
```bash
# Install and configure
rovo-code-flow acli install

# Authenticate
rovo-code-flow acli auth

# Complete setup (install + auth)
rovo-code-flow acli setup
```

### Run ACLI Commands
```bash
# Run with specific instruction
rovo-code-flow acli run --instruction "Create a Jira ticket for the new feature"

# Run in interactive mode
rovo-code-flow acli run --interactive
```

## Utility Commands

### Token Usage
```bash
rovo-code-flow usage
```

### Session Management
```bash
# List sessions
rovo-code-flow sessions --list

# Clear current session
rovo-code-flow sessions --clear

# Prune session to reduce tokens
rovo-code-flow sessions --prune

# Switch to different session
rovo-code-flow sessions --switch session-id
```

### Instructions Management
```bash
# List saved instructions
rovo-code-flow instructions --list

# Add new instruction
rovo-code-flow instructions --add

# Remove instruction
rovo-code-flow instructions --remove 1

# Run saved instruction
rovo-code-flow instructions --run 1
```

### Feedback and Support
```bash
# Report a bug
rovo-code-flow feedback --bug

# Request a feature
rovo-code-flow feedback --feature
```

## Interactive Mode Commands

When in interactive mode (`rovo-code-flow interactive`), you can use these special commands:

```bash
# Session management
/sessions
/clear
/prune

# Memory operations
/memory init
# This is a note
#! Remove this note

# Instructions
/instructions

# Utilities
/usage
/feedback

# Help and exit
/help
/exit
```

## Advanced Workflows

### Complete Project Setup
```bash
# 1. Initialize project
rovo-code-flow init --sparc --event

# 2. Add project context to memory
rovo-code-flow memory add "Building an e-commerce platform with React and Node.js" --repo

# 3. Start with architecture design
rovo-code-flow sparc architect "Design microservices architecture for e-commerce"

# 4. Model the business processes
rovo-code-flow event modeler "Model the complete customer journey from browsing to purchase"

# 5. Implement with swarm
rovo-code-flow swarm "Implement the user authentication and product catalog services" --strategy development --max-agents 3
```

### Continuous Development Workflow
```bash
# Start interactive mode for ongoing development
rovo-code-flow interactive --prompt "I'm working on implementing the shopping cart feature"

# Within interactive mode:
# - Use natural language for tasks
# - Add notes with # prefix
# - Use /instructions to save common tasks
# - Use /sessions to manage conversation history
```

### Code Review and Security
```bash
# Security review
rovo-code-flow sparc security "Review the payment processing implementation for security vulnerabilities"

# Code quality check
rovo-code-flow sparc coder "Review and refactor the user service for better maintainability"

# Test coverage
rovo-code-flow sparc tdd "Analyze test coverage and add missing tests for critical paths"
```

## Tips and Best Practices

1. **Use Memory Effectively**: Add important project context to memory files for better agent understanding.

2. **Combine Methodologies**: Use SPARC for implementation and Event Modeling for business process understanding.

3. **Leverage Swarms**: Use parallel swarms for independent tasks, sequential for dependent tasks.

4. **Interactive Mode**: Great for exploratory work and iterative development.

5. **Session Management**: Regularly prune sessions to manage token usage while retaining context.

6. **Instructions**: Save frequently used commands as instructions for quick access.