# Modern Calculator Development - Command Reference

This document provides a comprehensive reference for all rovo-code-flow commands used in the modern calculator development workflow.

## 🚀 Quick Execution Options

### Option 1: Full Automated Workflow
```bash
# Run the complete workflow
./calculator-development-workflow.sh

# Preview all commands without execution
./calculator-development-workflow.sh --dry-run
```

### Option 2: Phase-by-Phase Execution
Execute each phase individually for better control:

## 📋 Phase-by-Phase Command Reference

### Phase 1: Project Initialization
```bash
# Initialize project with both methodologies
rovo-code-flow init --sparc --event

# Set up project context in memory
rovo-code-flow memory add "Building a modern web-based calculator with React, TypeScript, and advanced features like history, themes, and scientific functions" --repo
rovo-code-flow memory add "Tech stack: React 18, TypeScript, Vite, Tailwind CSS, Zustand for state management, Vitest for testing" --repo
rovo-code-flow memory add "Features: Basic arithmetic, scientific functions, history, themes, keyboard support, responsive design, accessibility" --repo
```

### Phase 2: Architecture Design (SPARC Architect)
```bash
# System architecture
rovo-code-flow sparc architect "Design the overall architecture for a modern calculator application with modular components, state management, and extensible plugin system"

# Component architecture
rovo-code-flow sparc architect "Design the component hierarchy and data flow for the calculator, including display, keypad, history, and settings components"

# State management design
rovo-code-flow sparc architect "Design the state management pattern for calculator operations, history tracking, and user preferences"

# Plugin architecture
rovo-code-flow sparc architect "Design a plugin architecture that allows adding new calculator functions and themes dynamically"
```

### Phase 3: Event Modeling (Business Logic)
```bash
# Core workflow modeling
rovo-code-flow event modeler "Model the complete calculation workflow from user input to result display, including error handling and edge cases"

# User interaction timeline
rovo-code-flow event timeline "Create a timeline for user interactions: button press → calculation → display update → history storage"

# State transitions
rovo-code-flow event state "Model state transitions for calculator modes: basic → scientific → programmer, and operation states"

# UI/UX flows
rovo-code-flow event ui "Map the user interface flows for all calculator features including responsive layouts and accessibility patterns"

# System integration
rovo-code-flow event mapper "Map the integration points between calculator engine, UI components, storage, and external services"
```

### Phase 4: Test-Driven Development (SPARC TDD)
```bash
# Core engine tests
rovo-code-flow sparc tdd "Write comprehensive tests for the calculator engine covering basic arithmetic, scientific functions, and edge cases like division by zero"

# Component tests
rovo-code-flow sparc tdd "Write tests for React component interactions, user input handling, and state updates"

# Integration tests
rovo-code-flow sparc tdd "Write integration tests for the complete calculation workflow from input to display"

# Accessibility tests
rovo-code-flow sparc tdd "Write tests for keyboard navigation, screen reader compatibility, and ARIA attributes"

# Performance tests
rovo-code-flow sparc tdd "Write performance tests for complex calculations and UI responsiveness"
```

### Phase 5: Core Implementation (SPARC Coder)
```bash
# Project setup
rovo-code-flow sparc coder "Set up the React TypeScript project with Vite, configure Tailwind CSS, and set up the development environment"

# Calculator engine
rovo-code-flow sparc coder "Implement the calculator engine with support for basic arithmetic, scientific functions, and expression parsing"

# React components
rovo-code-flow sparc coder "Implement the main Calculator component with Display, Keypad, and Button components using TypeScript and Tailwind CSS"

# State management
rovo-code-flow sparc coder "Implement Zustand store for calculator state, history management, and user preferences"

# Scientific functions
rovo-code-flow sparc coder "Implement scientific calculator functions: trigonometry, logarithms, exponentials, and constants"

# History and memory
rovo-code-flow sparc coder "Implement calculation history, memory functions (M+, M-, MR, MC), and persistent storage"

# Theme system
rovo-code-flow sparc coder "Implement a dynamic theme system with light, dark, and custom themes using CSS variables"

# Keyboard support
rovo-code-flow sparc coder "Implement comprehensive keyboard support with shortcuts for all calculator functions"

# Responsive design
rovo-code-flow sparc coder "Implement responsive design that works on desktop, tablet, and mobile devices"

# Accessibility
rovo-code-flow sparc coder "Implement accessibility features: ARIA labels, keyboard navigation, screen reader support"
```

### Phase 6: Security Review (SPARC Security)
```bash
# Input validation
rovo-code-flow sparc security "Review input validation and sanitization to prevent injection attacks and malformed expressions"

# Client-side security
rovo-code-flow sparc security "Analyze client-side security including XSS prevention, secure storage, and data validation"

# Dependency audit
rovo-code-flow sparc security "Audit all dependencies for known vulnerabilities and recommend security updates"

# Privacy protection
rovo-code-flow sparc security "Review data handling practices, local storage security, and user privacy protection"
```

### Phase 7: Multi-Agent Coordination (Swarms)
```bash
# Parallel feature development
rovo-code-flow swarm "Implement advanced calculator features: unit converter, graphing capability, and equation solver" --parallel --strategy implementation --max-agents 3

# Sequential integration
rovo-code-flow swarm "Integrate all calculator components, run comprehensive testing, and prepare for deployment" --strategy development --max-agents 2

# Performance optimization
rovo-code-flow swarm "Optimize calculator performance: bundle size, rendering speed, and memory usage" --parallel --strategy development --max-agents 2
```

### Phase 8: DevOps and Deployment (SPARC DevOps)
```bash
# CI/CD pipeline
rovo-code-flow sparc devops "Set up CI/CD pipeline with GitHub Actions for automated testing, building, and deployment to Vercel/Netlify"

# Monitoring setup
rovo-code-flow sparc devops "Configure performance monitoring, error tracking, and analytics for the calculator application"

# Production optimization
rovo-code-flow sparc devops "Optimize the production build with code splitting, lazy loading, and CDN configuration"

# Deployment automation
rovo-code-flow sparc devops "Automate deployment process with environment management, rollback capabilities, and health checks"
```

### Phase 9: Agent Management
```bash
# Spawn specialized agents
rovo-code-flow agent spawn calculator-engine-agent
rovo-code-flow agent spawn ui-component-agent
rovo-code-flow agent spawn testing-agent

# List active agents
rovo-code-flow agent list

# Coordinate agents
rovo-code-flow swarm "Add scientific graphing calculator with plot visualization" --parallel --max-agents 3

# Clean up agents when done
rovo-code-flow agent kill calculator-engine-agent
rovo-code-flow agent kill ui-component-agent
rovo-code-flow agent kill testing-agent
```

### Phase 10: Knowledge Management
```bash
# Store implementation patterns
rovo-code-flow memory add "Calculator uses the Command pattern for operations and Observer pattern for state updates" --repo

# Store optimizations
rovo-code-flow memory add "Implemented memoization for complex calculations and virtual scrolling for history list" --repo

# Store accessibility info
rovo-code-flow memory add "All buttons have ARIA labels, keyboard shortcuts follow standard conventions, high contrast mode supported" --repo

# Store testing info
rovo-code-flow memory add "Unit tests cover 95% of calculator engine, E2E tests cover all user workflows, performance tests ensure <100ms response" --repo

# View all project knowledge
rovo-code-flow memory list --repo

# Remove outdated information
rovo-code-flow memory remove "outdated pattern" --repo
```

### Phase 11: Advanced Features
```bash
# Matrix calculator
rovo-code-flow sparc coder "Implement matrix calculator with operations for addition, multiplication, determinant, and inverse"

# Graphing functionality
rovo-code-flow sparc coder "Implement function graphing with zoom, pan, and multiple function plotting capabilities"

# Unit converter
rovo-code-flow sparc coder "Implement comprehensive unit converter for length, weight, temperature, currency, and more"

# Equation solver
rovo-code-flow sparc coder "Implement equation solver for linear, quadratic, and system of equations"

# Programmer mode
rovo-code-flow sparc coder "Implement programmer calculator with binary, octal, hexadecimal operations and bitwise functions"
```

### Phase 12: Quality Assurance
```bash
# Comprehensive testing
rovo-code-flow sparc tdd "Create comprehensive test suite covering all calculator modes, edge cases, and user scenarios"

# Performance optimization
rovo-code-flow sparc coder "Optimize calculator performance: lazy loading, code splitting, and efficient re-rendering"

# Cross-browser testing
rovo-code-flow sparc tdd "Test and ensure compatibility across Chrome, Firefox, Safari, and Edge browsers"

# Mobile optimization
rovo-code-flow sparc coder "Optimize touch interactions, gesture support, and mobile-specific UI improvements"
```

### Phase 13: Documentation
```bash
# Technical documentation
rovo-code-flow sparc architect "Create comprehensive technical documentation including API docs, component docs, and architecture diagrams"

# User documentation
rovo-code-flow sparc coder "Create user guide with tutorials, keyboard shortcuts, and feature explanations"

# Maintenance planning
rovo-code-flow sparc devops "Create maintenance plan including update procedures, monitoring, and support workflows"
```

## 🔧 Workflow Management Commands

### Session Management
```bash
# List all sessions
rovo-code-flow sessions --list

# Switch to specific session
rovo-code-flow sessions --switch calculator-development

# Clear current session
rovo-code-flow sessions --clear

# Prune session to reduce tokens
rovo-code-flow sessions --prune
```

### Instructions Management
```bash
# Add common instructions
rovo-code-flow instructions --add
# (Interactive: "Run calculator tests and check coverage")

rovo-code-flow instructions --add
# (Interactive: "Build and deploy calculator to staging")

# List saved instructions
rovo-code-flow instructions --list

# Run saved instruction
rovo-code-flow instructions --run 1

# Remove instruction
rovo-code-flow instructions --remove 2
```

### Interactive Development
```bash
# Start interactive mode
rovo-code-flow interactive --prompt "I'm working on the calculator project and need help with implementing the scientific functions"

# In interactive mode:
# - Use natural language for tasks
# - /memory init to refresh context
# - /sessions to manage workflows
# - /instructions to run saved commands
# - # Add implementation notes
# - #! Remove outdated notes
# - /exit to quit
```

### System Monitoring
```bash
# Check system status
rovo-code-flow status

# Monitor token usage
rovo-code-flow usage

# MCP server management
rovo-code-flow mcp list
rovo-code-flow mcp start --start calculator-tools
rovo-code-flow mcp stop --stop calculator-tools
```

### ACLI Integration (Optional)
```bash
# Setup Atlassian integration
rovo-code-flow acli setup

# Create project tickets
rovo-code-flow acli run --instruction "Create Jira epic for Modern Calculator project with all feature stories"

# Document in Confluence
rovo-code-flow acli run --instruction "Create Confluence page documenting the calculator architecture and implementation decisions"
```

## 🎯 Command Categories Summary

### Core Commands (3)
- `init` - Project initialization
- `start` - Start orchestrator
- `interactive` - Interactive development mode

### Agent Commands (4)
- `sparc` - SPARC methodology agents
- `event` - Event Modeling agents
- `agent` - Agent lifecycle management
- `swarm` - Multi-agent coordination

### System Commands (3)
- `status` - System health monitoring
- `memory` - Knowledge management
- `mcp` - Model Context Protocol servers

### Tool Commands (1)
- `acli` - Atlassian CLI integration

### Utility Commands (4)
- `usage` - Token usage tracking
- `sessions` - Session management
- `instructions` - Saved instructions
- `feedback` - Bug reports and feature requests

## 💡 Best Practices

1. **Start with Memory**: Always add project context to memory first
2. **Use Phases**: Execute phases sequentially for complex projects
3. **Leverage Swarms**: Use parallel swarms for independent features
4. **Monitor Progress**: Regular status checks and session management
5. **Document Decisions**: Store important patterns and decisions in memory
6. **Test Continuously**: Integrate testing throughout the development process
7. **Security First**: Include security reviews at multiple stages
8. **Optimize Performance**: Regular performance optimization cycles

## 🚀 Quick Start Templates

### Minimal Calculator (Basic Features)
```bash
rovo-code-flow init --sparc
rovo-code-flow sparc architect "Design basic calculator architecture"
rovo-code-flow sparc coder "Implement basic calculator with arithmetic operations"
rovo-code-flow sparc tdd "Write tests for basic calculator functions"
```

### Scientific Calculator (Advanced Features)
```bash
rovo-code-flow init --sparc --event
rovo-code-flow event modeler "Model scientific calculator workflow"
rovo-code-flow sparc architect "Design scientific calculator architecture"
rovo-code-flow sparc coder "Implement scientific calculator with advanced functions"
rovo-code-flow sparc tdd "Write comprehensive tests for scientific functions"
```

### Enterprise Calculator (Full Features)
```bash
# Use the complete workflow above for production-ready calculator
./calculator-development-workflow.sh
```