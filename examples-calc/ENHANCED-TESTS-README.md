# Enhanced Calculator Tests

This directory contains an enhanced test suite for the calculator example project that demonstrates the improved test runner features with a real-world application.

## Key Features

### 1. Test Dependencies
Tests can specify dependencies on other tests using the `dependsOn` property. Dependent tests will only run if their dependencies pass.

```javascript
{
  name: 'implement-calculator-engine',
  dependsOn: ['write-engine-tests'],
  // ...
}
```

### 2. Parallel Execution
Tests can be run in parallel using the `--parallel` flag for faster execution. The test runner respects dependencies and priorities even in parallel mode.

```bash
npm run test:enhanced:parallel
```

### 3. Test Filtering
Tests can be filtered by name or description using the `--filter` option.

```bash
node enhanced-calculator-tests.js --filter architect
```

### 4. Automatic Retries
Failed tests can be automatically retried using the `--retries` option or per-test retry configuration.

```javascript
{
  name: 'implement-calculator-engine',
  retries: 2,
  // ...
}
```

### 5. Priority-Based Execution
Tests can be assigned priorities to ensure they run in a logical order.

```javascript
{
  name: 'setup-project-memory',
  priority: 2,
  // ...
}
```

### 6. Category Organization
Tests are organized into logical categories for better management:

- setup
- architecture
- modeling
- testing
- implementation
- quality
- deployment
- coordination
- monitoring

### 7. Detailed Reporting
Test results are saved to JSON files with comprehensive information about each test run.

## Running the Tests

### Quick Demo
```bash
npm run test:enhanced:demo
```

### Basic Test Run
```bash
npm run test:enhanced
```

### Dry Run (Preview Only)
```bash
npm run test:enhanced:dry
```

### Run Specific Category
```bash
npm run test:enhanced:setup
npm run test:enhanced:arch
```

### Advanced Options
```bash
# Run tests in parallel
node enhanced-calculator-tests.js --parallel

# Run with automatic retries
node enhanced-calculator-tests.js --retries=2

# Filter tests by name or description
node enhanced-calculator-tests.js --filter "display"

# Run with verbose output
node enhanced-calculator-tests.js --verbose

# Combine options
node enhanced-calculator-tests.js --category implementation --parallel --retries=2
```

## Test Structure

Each test is defined with the following properties:

```javascript
{
  name: 'test-name',              // Unique identifier
  command: 'command-name',        // CLI command to run
  args: ['arg1', 'arg2'],         // Command arguments
  options: ['--option', 'value'], // Command options
  description: 'Test description',// Human-readable description
  timeout: 30000,                 // Timeout in milliseconds
  dependsOn: ['other-test'],      // Test dependencies
  priority: 5,                    // Execution priority (lower runs first)
  retries: 2                      // Number of retries if test fails
}
```

## Integration with Calculator Workflow

The enhanced tests are designed to test the complete calculator development workflow, from project initialization to deployment, using the rovo-code-flow CLI.

The test suite demonstrates how a complex, real-world application can be developed using a structured, test-driven approach with the improved test runner.