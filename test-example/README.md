# Rovo Code Flow Test Example

This directory contains a comprehensive test application to verify that the rovo-code-flow CLI is working correctly with all available commands and parameters.

## Quick Start

```bash
# 1. Setup the test environment
./setup.sh

# 2. Validate setup
node validate.js

# 3. Run all tests
npm test

# 4. View results
ls results/
```

## Project Structure

```
test-example/
├── README.md              # This file
├── TESTING.md             # Comprehensive testing guide
├── EXAMPLES.md            # CLI usage examples
├── setup.sh               # Setup script
├── validate.js            # Validation script
├── test-runner.js         # Main test runner
├── package.json           # Dependencies and scripts
├── test-scenarios/        # Test documentation
│   ├── core-commands.md
│   ├── agent-commands.md
│   ├── system-commands.md
│   ├── tool-commands.md
│   └── utility-commands.md
├── test-data/             # Sample data
│   ├── sample-instructions.json
│   └── sample-memory-notes.md
└── results/               # Test execution results
```

## Test Categories

### Core Commands (`npm run test:core`)
- **init**: Initialize with SPARC/Event Modeling modes
- **start**: Start orchestrator with UI options
- **interactive**: Interactive mode with prompts

### Agent Commands (`npm run test:agent`)
- **sparc**: All SPARC modes (architect, coder, tdd, security, devops)
- **event**: All Event Modeling roles (modeler, timeline, ui, state, mapper)
- **agent**: Agent lifecycle (spawn, list, kill)
- **swarm**: Multi-agent coordination (parallel/sequential, strategies)

### System Commands (`npm run test:system`)
- **status**: System health and metrics
- **memory**: Knowledge management (init, add, list, remove, scopes)
- **mcp**: Model Context Protocol server management

### Tool Commands (`npm run test:tools`)
- **acli**: Atlassian CLI integration (install, auth, run)

### Utility Commands (`npm run test:utility`)
- **usage**: Token usage tracking
- **sessions**: Session management (list, clear, prune)
- **instructions**: Saved instructions (list, add, remove, run)
- **feedback**: Bug reports and feature requests

## Available Commands

```bash
# Test execution
npm test                    # Run all tests
npm run test:core          # Core commands only
npm run test:agent         # Agent commands only
npm run test:system        # System commands only
npm run test:tools         # Tool commands only
npm run test:utility       # Utility commands only
npm run test:verbose       # Verbose output
npm run test:dry-run       # Preview without execution

# Utilities
node validate.js           # Validate setup
node test-runner.js categories  # List test categories
npm run clean              # Clean test artifacts
```

## Test Coverage

This test suite comprehensively covers:

- All CLI Commands: Every command and subcommand
- All Parameters: Every option and flag
- Error Handling: Invalid inputs and edge cases
- File Operations: Directory creation, memory files
- Agent Lifecycle: Spawn, execute, terminate
- Integration Points: ACLI, MCP, memory system
- Interactive Features: Prompts, sessions, feedback

## Test Results

### Console Output
- PASSED: Test executed successfully
- FAILED: Test failed with error
- SKIPPED: Test skipped (dry-run mode)

### Detailed Reports
Results saved to `results/test-report-{timestamp}.json` with:
- Summary statistics (passed/failed/errors)
- Individual test results and timing
- Error details and output logs
- Execution metadata

## Troubleshooting

### Prerequisites
- Node.js 18+ required
- rovo-code-flow must be built (`cd ../rovo-code-flow && npm run build`)

### Common Issues
1. **CLI not found**: Run `./setup.sh` to build dependencies
2. **Permission denied**: Run `chmod +x setup.sh validate.js test-runner.js`
3. **Test failures**: Check detailed report in `results/` directory
4. **Timeout errors**: Some tests have shorter timeouts for CI/automation

### Manual Testing
For interactive features requiring user input:
```bash
# Test interactive mode manually
node ../rovo-code-flow/dist/cli.js interactive

# Test ACLI setup manually  
node ../rovo-code-flow/dist/cli.js acli setup
```

## Documentation

- **[TESTING.md](TESTING.md)**: Comprehensive testing guide
- **[EXAMPLES.md](EXAMPLES.md)**: CLI usage examples and workflows
- **[test-scenarios/](test-scenarios/)**: Detailed test specifications

## Expected Outcomes

Each test verifies:
1. Command executes without errors
2. Expected output is generated  
3. Files/directories created as needed
4. Configuration properly updated
5. Error handling works correctly
6. Integration points function properly

## Ready to Test!

The test suite is designed to be:
- **Comprehensive**: Covers all CLI functionality
- **Automated**: Runs without user intervention
- **Informative**: Provides detailed results and logs
- **Flexible**: Supports category-specific and verbose testing
- **Reliable**: Handles timeouts and error conditions

Start testing with `npm test` and explore the full capabilities of rovo-code-flow!