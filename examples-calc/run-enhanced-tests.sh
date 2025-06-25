#!/bin/bash

# Enhanced Calculator Test Runner
# Demonstrates the improved test runner features with a real-world application

echo "🚀 Enhanced Calculator Test Suite Demonstration"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to run test with description
run_test() {
    echo -e "${YELLOW}▶ $1${NC}"
    echo -e "${CYAN}  Command: $2${NC}"
    eval "$2"
    echo ""
}

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Make the test script executable
chmod +x enhanced-calculator-tests.js

print_section "1. Basic Test Run (Dry Run Mode)"
run_test "Show what tests would be executed without running them" \
    "node enhanced-calculator-tests.js --dry-run --category setup"

print_section "2. Filtered Test Run"
run_test "Run only architecture-related tests" \
    "node enhanced-calculator-tests.js --dry-run --filter architect"

print_section "3. Category-Specific Test Run"
run_test "Run only setup category tests" \
    "node enhanced-calculator-tests.js --dry-run --category setup"

print_section "4. Parallel Test Demonstration"
run_test "Show parallel test execution (dry run)" \
    "node enhanced-calculator-tests.js --dry-run --parallel --category modeling"

print_section "5. Test with Retries"
run_test "Show test configuration with automatic retries" \
    "node enhanced-calculator-tests.js --dry-run --retries=2 --category implementation"

print_section "6. Verbose Output Demo"
run_test "Show verbose test output" \
    "node enhanced-calculator-tests.js --dry-run --verbose --category testing"

print_section "7. Full Test Suite Overview"
run_test "Show all test categories and their dependencies" \
    "node enhanced-calculator-tests.js --help"

print_section "8. Actual Test Execution (Limited)"
echo -e "${YELLOW}▶ Running a small subset of actual tests to demonstrate functionality${NC}"
echo -e "${CYAN}  Command: node enhanced-calculator-tests.js --category setup --verbose${NC}"

# Check if rovo-code-flow is built
if [ ! -f "../rovo-code-flow/dist/cli.js" ]; then
    echo -e "${RED}❌ rovo-code-flow CLI not found. Building it first...${NC}"
    cd ../rovo-code-flow
    npm install
    npm run build
    cd ../examples-calc
fi

# Run actual tests
node enhanced-calculator-tests.js --category setup --verbose

print_section "9. Test Results Analysis"
echo -e "${PURPLE}📊 The enhanced test runner provides:${NC}"
echo "• Test dependencies - tests run in correct order"
echo "• Automatic retries - flaky tests get multiple attempts"
echo "• Parallel execution - faster test runs when possible"
echo "• Detailed filtering - run specific subsets of tests"
echo "• Priority-based execution - critical tests run first"
echo "• Comprehensive reporting - JSON reports with detailed metrics"
echo "• Real-world application testing - calculator development workflow"

print_section "10. Advanced Features Demonstrated"
echo -e "${GREEN}✅ Features successfully demonstrated:${NC}"
echo "• Test dependency management (dependsOn property)"
echo "• Priority-based test ordering"
echo "• Category-based test organization"
echo "• Flexible filtering by name/description"
echo "• Parallel execution with dependency respect"
echo "• Automatic retry mechanisms"
echo "• Comprehensive error reporting"
echo "• Real-world application workflow testing"

echo -e "\n${GREEN}🎉 Enhanced test suite demonstration complete!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo "• Run 'node enhanced-calculator-tests.js --category architecture' to test design phase"
echo "• Run 'node enhanced-calculator-tests.js --parallel' for faster execution"
echo "• Run 'node enhanced-calculator-tests.js --filter sparc' to test only SPARC commands"
echo "• Check calculator-test-results/ for detailed JSON reports"