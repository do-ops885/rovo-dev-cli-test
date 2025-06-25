# Rovo Code Flow Testing Guide

This comprehensive test suite verifies that the rovo-code-flow CLI is working correctly with all available commands and parameters.

## Quick Start

```bash
# Setup the test environment
./setup.sh

# Run all tests
npm test

# Run specific category
npm run test:core
```

## Test Categories

### Advanced Test Features

The test runner includes several advanced features:

1. **Test Dependencies**: Tests can specify dependencies on other tests using the `dependsOn` property. Dependent tests will only run if their dependencies pass.

2. **Parallel Execution**: Tests can be run in parallel using the `--parallel` flag for faster execution.

3. **Test Filtering**: Tests can be filtered by name or description using the `--filter` option.

4. **Automatic Retries**: Failed tests can be automatically retried using the `--retries` option.

5. **Detailed Reporting**: Test results are saved to JSON files with detailed information about each test run.


### 1. Core Commands (`npm run test:core`)

Tests fundamental CLI operations:

- **init**: Initialize project with SPARC/Event Modeling modes
  - `--sparc`: SPARC mode initialization
  - `--event`: Event Modeling mode initialization
  - Combined initialization with both modes

- **start**: Start the orchestrator
  - Basic startup
  - UI mode with custom port (`--ui --port 3001`)

- **interactive**: Interactive mode
  - With initial prompt (`--prompt`)

### 2. Agent Commands (`npm run test:agent`)

Tests agent creation and task execution:

- **sparc**: SPARC methodology agents
  - `architect`: System design and architecture
  - `coder`: Code implementation (uses CoderAgent)
  - `tdd`: Test-driven development
  - `security`: Security analysis
  - `devops`: Deployment and operations

- **event**: Event Modeling methodology agents
  - `modeler`: Core event modeling (uses ModelerAgent)
  - `timeline`: Event timeline planning
  - `ui`: UI/UX mapping
  - `state`: State modeling
  - `mapper`: System mapping

- **agent**: Agent lifecycle management
  - `spawn`: Create new agents
  - `list`: List active agents
  - `kill`: Terminate agents

- **swarm**: Multi-agent coordination
  - Sequential execution with development strategy
  - Parallel execution (`--parallel`) with implementation strategy
  - Custom agent limits (`--max-agents`)

### 3. System Commands (`npm run test:system`)

Tests system management features:

- **status**: System health and metrics
- **memory**: Knowledge management
  - `init`: Initialize memory files
  - `add`: Add notes to local/global/repo memory
  - `list`: View memory contents
  - `remove`: Remove notes
  - Memory scope options: `--global`, `--repo`

- **mcp**: Model Context Protocol server management
  - `list`: List configured servers

### 4. Tool Commands (`npm run test:tools`)

Tests external tool integrations:

- **acli**: Atlassian CLI integration
  - `install`: Setup ACLI integration
  - `run`: Execute with instructions (`--instruction`)

### 5. Utility Commands (`npm run test:utility`)

Tests utility and management features:

- **usage**: Token usage tracking
- **sessions**: Session management
  - `--list`: List all sessions
  - `--clear`: Clear current session
  - `--prune`: Reduce session token usage

- **instructions**: Saved instruction management
  - `--list`: List saved instructions

- **feedback**: Bug reporting and feature requests
  - `--bug`: Report bugs
  - `--feature`: Request features

## Test Execution Options

### Verbose Mode
```bash
npm run test:verbose
```
Shows detailed command output and execution logs.

### Dry Run Mode
```bash
npm run test:dry-run
```
Shows commands that would be executed without actually running them.

### Category-Specific Testing
```bash
npm run test:core      # Core commands only
npm run test:agent     # Agent commands only
npm run test:system    # System commands only
npm run test:tools     # Tool commands only
npm run test:utility   # Utility commands only
```

### List Available Categories
```bash
node test-runner.js categories
```

## Test Results

### Console Output
- ✅ **PASSED**: Test executed successfully
- ❌ **FAILED**: Test failed with error
- ⚠️ **SKIPPED**: Test skipped (dry-run mode)

### Detailed Reports
Test results are saved to `results/test-report-{timestamp}.json` with:
- Summary statistics
- Individual test results
- Execution times
- Error details

### Expected Behaviors

#### Successful Tests
- Commands execute without errors
- Expected output is generated
- Files/directories created as needed
- Configuration properly updated

#### Interactive Commands
Some commands require user interaction and use automated input:
- Interactive mode: Sends `/exit` to terminate
- Feedback commands: Sends 'n' to skip prompts

#### Timeout Handling
- Most tests: 30 second timeout
- Interactive tests: 10 second timeout
- Start commands: 5 second timeout (quick verification)

## Troubleshooting

### Common Issues

1. **Node.js Version**
   - Requires Node.js 18+
   - Check with `node -v`

2. **Build Issues**
   - Ensure rovo-code-flow is built: `cd ../rovo-code-flow && npm run build`

3. **Permission Issues**
   - Make setup script executable: `chmod +x setup.sh`

4. **Test Failures**
   - Check detailed report in `results/` directory
   - Run with verbose mode for more details
   - Verify rovo-code-flow CLI is properly built

### Manual Testing

For commands requiring extensive user interaction:
```bash
# Test interactive mode manually
node ../rovo-code-flow/dist/cli.js interactive

# Test ACLI authentication manually
node ../rovo-code-flow/dist/cli.js acli auth

# Test instruction management manually
node ../rovo-code-flow/dist/cli.js instructions --add
```

## Test Coverage

This test suite covers:
- ✅ All CLI commands and subcommands
- ✅ All command-line options and flags
- ✅ Error handling and validation
- ✅ File system operations
- ✅ Agent lifecycle management
- ✅ Memory system operations
- ✅ Integration points (ACLI, MCP)

## Contributing

To add new tests:
1. Add test definition to appropriate category in `test-runner.js`
2. Document expected behavior in `test-scenarios/`
3. Update this guide if needed
4. Test with both dry-run and actual execution