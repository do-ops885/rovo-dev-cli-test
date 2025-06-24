# Workflow Management Guide

The Rovo Code Flow workflow management system provides enterprise-grade phase tracking, dependency management, and progress monitoring for development workflows.

## Overview

The workflow system allows you to:
- **Track Progress**: Automatically monitor which phases are completed
- **Manage Dependencies**: Ensure prerequisites are met before starting phases
- **Resume Workflows**: Continue from any point without losing progress
- **Validate Completion**: Verify phase requirements are satisfied
- **Template Workflows**: Use predefined or custom workflow templates

## Quick Start

### 1. Initialize the Workflow System

```bash
rovo-code-flow workflow init
```

This creates:
- Default workflow templates (calculator development, generic development)
- Workflow state management
- Template storage directories

### 2. Start a Workflow

```bash
# List available templates
rovo-code-flow workflow templates

# Start a specific workflow
rovo-code-flow workflow start calculator-development

# Or let the system guide you
rovo-code-flow workflow start
```

### 3. Check Progress

```bash
# View detailed workflow status
rovo-code-flow workflow status

# Quick status in system overview
rovo-code-flow status
```

### 4. Execute Phases

```bash
# Resume from current phase
rovo-code-flow workflow resume

# Run a specific phase
rovo-code-flow workflow run <phase-id>

# Execute with dry-run to see what would happen
rovo-code-flow workflow resume --dry-run
```

## Workflow Commands

### Core Commands

| Command | Description | Example |
|---------|-------------|---------|
| `workflow init` | Initialize workflow system | `rovo-code-flow workflow init` |
| `workflow start <template>` | Start new workflow | `rovo-code-flow workflow start calculator-development` |
| `workflow status` | Show detailed progress | `rovo-code-flow workflow status` |
| `workflow resume` | Continue from next phase | `rovo-code-flow workflow resume` |

### Management Commands

| Command | Description | Example |
|---------|-------------|---------|
| `workflow pause` | Pause current workflow | `rovo-code-flow workflow pause` |
| `workflow reset` | Reset workflow state | `rovo-code-flow workflow reset --force` |
| `workflow complete <phase>` | Mark phase as done | `rovo-code-flow workflow complete initialization` |
| `workflow skip <phase>` | Skip a phase | `rovo-code-flow workflow skip security` |

### Information Commands

| Command | Description | Example |
|---------|-------------|---------|
| `workflow templates` | List available templates | `rovo-code-flow workflow templates` |
| `workflow phases` | List phases in workflow | `rovo-code-flow workflow phases` |
| `workflow validate <phase>` | Validate phase completion | `rovo-code-flow workflow validate setup` |

## Automatic Progress Tracking

The system automatically tracks progress when you run SPARC or Event Modeling commands:

```bash
# This command will automatically update workflow progress
rovo-code-flow sparc architect "Design calculator architecture"

# The system will:
# 1. Match the command to a workflow phase
# 2. Mark the phase as completed if successful
# 3. Show the next available phase
# 4. Provide workflow suggestions
```

### Smart Command Matching

The workflow tracker uses intelligent matching to connect commands with workflow phases:

- **Command Type**: Matches `sparc`, `event`, etc.
- **Mode/Role**: Matches `architect`, `coder`, `modeler`, etc.
- **Description Keywords**: Analyzes task descriptions for relevant terms
- **Context Awareness**: Considers current workflow state and dependencies

## Workflow Templates

### Built-in Templates

#### Calculator Development Workflow
A comprehensive template for building modern web calculators:

**Phases:**
1. **Initialization** - Project setup and configuration
2. **Architecture** - System design and component planning
3. **Event Modeling** - Business logic and user interaction modeling
4. **TDD** - Test-driven development setup
5. **Implementation** - Core feature development
6. **Security** - Security review and hardening (optional)
7. **Deployment** - CI/CD and production deployment

#### Generic Development Workflow
A flexible template for general software projects:

**Phases:**
1. **Setup** - Project initialization
2. **Planning** - Architecture and design
3. **Development** - Implementation

### Custom Templates

Create custom workflow templates by defining phases, dependencies, and commands:

```json
{
  "id": "my-custom-workflow",
  "name": "My Custom Development Workflow",
  "description": "A custom workflow for my specific needs",
  "version": "1.0.0",
  "phases": [
    {
      "id": "setup",
      "name": "Project Setup",
      "description": "Initialize project structure",
      "dependencies": [],
      "commands": [
        {
          "command": "rovo-code-flow",
          "args": ["init", "--sparc"],
          "description": "Initialize SPARC methodology"
        }
      ]
    }
  ]
}
```

## Phase Management

### Phase States

- **Not Started**: Phase hasn't been executed yet
- **In Progress**: Phase is currently being executed
- **Completed**: Phase finished successfully
- **Failed**: Phase encountered errors
- **Skipped**: Phase was intentionally skipped

### Dependencies

Phases can depend on other phases:

```json
{
  "id": "implementation",
  "name": "Implementation",
  "dependencies": ["architecture", "tdd"],
  "commands": [...]
}
```

The system ensures dependencies are satisfied before allowing phase execution.

### Validation

Phases can include validation criteria:

```json
{
  "validation": {
    "requiredFiles": ["package.json", "src/index.ts"],
    "requiredDirectories": ["src", "tests"],
    "customValidation": "() => checkCustomCriteria()"
  }
}
```

## Integration with Existing Commands

### Enhanced Status Command

The `rovo-code-flow status` command now includes workflow information:

```bash
rovo-code-flow status
```

Shows:
- System health metrics
- Active workflow status
- Current phase progress
- Next recommended actions

### SPARC and Event Commands

All SPARC and Event Modeling commands automatically:
- Track execution time
- Update workflow progress
- Show next phase suggestions
- Handle failures gracefully

### Memory Integration

Workflow progress is integrated with the memory system:
- Phase completion is logged
- Artifacts are tracked
- Context is preserved across sessions

## Best Practices

### 1. Start with Templates

Use built-in templates as starting points:
```bash
rovo-code-flow workflow templates
rovo-code-flow workflow start calculator-development
```

### 2. Check Status Regularly

Monitor progress frequently:
```bash
rovo-code-flow workflow status
```

### 3. Use Dry Runs

Test phase execution without making changes:
```bash
rovo-code-flow workflow resume --dry-run
```

### 4. Handle Failures Gracefully

If a phase fails:
```bash
# Check what went wrong
rovo-code-flow workflow status

# Fix issues and retry
rovo-code-flow workflow resume

# Or skip if not critical
rovo-code-flow workflow skip <phase-id>
```

### 5. Validate Completion

Ensure phases are properly completed:
```bash
rovo-code-flow workflow validate <phase-id>
```

## Advanced Features

### Parallel Execution

Some workflows support parallel phase execution:
```bash
rovo-code-flow workflow resume --parallel
```

### Custom Validation

Implement custom validation logic for complex requirements.

### Workflow Analytics

Track metrics like:
- Phase completion times
- Failure rates
- Workflow efficiency
- Team productivity

### Integration with CI/CD

Workflows can be integrated with continuous integration:
- Automatic phase progression
- Build pipeline integration
- Deployment automation

## Troubleshooting

### Common Issues

**Workflow not starting:**
- Ensure system is initialized: `rovo-code-flow workflow init`
- Check template exists: `rovo-code-flow workflow templates`

**Phase not completing automatically:**
- Verify command matches workflow definition
- Check phase dependencies are satisfied
- Use manual completion: `rovo-code-flow workflow complete <phase-id>`

**Validation failures:**
- Check required files exist
- Verify directory structure
- Run validation manually: `rovo-code-flow workflow validate <phase-id>`

### Debug Mode

Enable verbose logging for troubleshooting:
```bash
DEBUG=workflow rovo-code-flow workflow status
```

### Reset and Recovery

If workflow state becomes corrupted:
```bash
# Reset completely
rovo-code-flow workflow reset --force

# Or start fresh
rovo-code-flow workflow start <template-id>
```

## Examples

### Complete Calculator Development

```bash
# Initialize workflow system
rovo-code-flow workflow init

# Start calculator workflow
rovo-code-flow workflow start calculator-development

# Execute phases automatically
rovo-code-flow sparc architect "Design calculator architecture"
rovo-code-flow event modeler "Model calculation workflow"
rovo-code-flow sparc tdd "Write calculator tests"
rovo-code-flow sparc coder "Implement calculator engine"

# Check progress
rovo-code-flow workflow status

# Resume if needed
rovo-code-flow workflow resume
```

### Custom Workflow

```bash
# Create custom template (manual process)
# Start custom workflow
rovo-code-flow workflow start my-custom-workflow

# Execute with dry run first
rovo-code-flow workflow resume --dry-run

# Execute for real
rovo-code-flow workflow resume
```

## API Reference

The workflow system provides programmatic access through:

- `WorkflowManager` class for core functionality
- `WorkflowTracker` for automatic progress tracking
- Template system for custom workflows
- Validation framework for quality assurance

See the source code for detailed API documentation.