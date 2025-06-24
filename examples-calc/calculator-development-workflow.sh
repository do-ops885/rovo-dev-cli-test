#!/bin/bash

# Modern Calculator Development with Rovo Code Flow
# Complete workflow demonstrating all CLI capabilities

set -e  # Exit on any error

echo "🚀 Starting Modern Calculator Development with Rovo Code Flow"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print phase headers
print_phase() {
    echo -e "\n${BLUE}📋 Phase $1: $2${NC}"
    echo "----------------------------------------"
}

# Function to execute command with logging
execute_cmd() {
    echo -e "${YELLOW}▶ $1${NC}"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "  [DRY RUN] Would execute: $1"
    else
        # Replace rovo-code-flow with the correct path
        local cmd=$(echo "$1" | sed 's/rovo-code-flow/node ..\/rovo-code-flow\/dist\/cli.js/g')
        eval "$cmd"
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}  ✅ Success${NC}"
        else
            echo -e "${RED}  ❌ Failed${NC}"
            exit 1
        fi
    fi
    sleep 1  # Brief pause between commands
}

# Check if dry run mode
DRY_RUN=${1:-false}
if [[ "$DRY_RUN" == "--dry-run" ]]; then
    DRY_RUN="true"
    echo -e "${YELLOW}🔍 Running in DRY RUN mode - no commands will be executed${NC}"
fi

# Phase 1: Project Initialization
print_phase "1" "Project Initialization"

execute_cmd "rovo-code-flow init --sparc --event"

execute_cmd 'rovo-code-flow memory add "Building a modern web-based calculator with React, TypeScript, and advanced features like history, themes, and scientific functions" --repo'

execute_cmd 'rovo-code-flow memory add "Tech stack: React 18, TypeScript, Vite, Tailwind CSS, Zustand for state management, Vitest for testing" --repo'

execute_cmd 'rovo-code-flow memory add "Features: Basic arithmetic, scientific functions, history, themes, keyboard support, responsive design, accessibility" --repo'

# Phase 2: Architecture and Design (SPARC Architect)
print_phase "2" "Architecture and Design (SPARC Architect)"

execute_cmd 'rovo-code-flow sparc architect "Design the overall architecture for a modern calculator application with modular components, state management, and extensible plugin system"'

execute_cmd 'rovo-code-flow sparc architect "Design the component hierarchy and data flow for the calculator, including display, keypad, history, and settings components"'

execute_cmd 'rovo-code-flow sparc architect "Design the state management pattern for calculator operations, history tracking, and user preferences"'

execute_cmd 'rovo-code-flow sparc architect "Design a plugin architecture that allows adding new calculator functions and themes dynamically"'

# Phase 3: Event Modeling (Business Logic Design)
print_phase "3" "Event Modeling (Business Logic Design)"

execute_cmd 'rovo-code-flow event modeler "Model the complete calculation workflow from user input to result display, including error handling and edge cases"'

execute_cmd 'rovo-code-flow event timeline "Create a timeline for user interactions: button press → calculation → display update → history storage"'

execute_cmd 'rovo-code-flow event state "Model state transitions for calculator modes: basic → scientific → programmer, and operation states"'

execute_cmd 'rovo-code-flow event ui "Map the user interface flows for all calculator features including responsive layouts and accessibility patterns"'

execute_cmd 'rovo-code-flow event mapper "Map the integration points between calculator engine, UI components, storage, and external services"'

# Phase 4: Test-Driven Development (SPARC TDD)
print_phase "4" "Test-Driven Development (SPARC TDD)"

execute_cmd 'rovo-code-flow sparc tdd "Write comprehensive tests for the calculator engine covering basic arithmetic, scientific functions, and edge cases like division by zero"'

execute_cmd 'rovo-code-flow sparc tdd "Write tests for React component interactions, user input handling, and state updates"'

execute_cmd 'rovo-code-flow sparc tdd "Write integration tests for the complete calculation workflow from input to display"'

execute_cmd 'rovo-code-flow sparc tdd "Write tests for keyboard navigation, screen reader compatibility, and ARIA attributes"'

execute_cmd 'rovo-code-flow sparc tdd "Write performance tests for complex calculations and UI responsiveness"'

# Phase 5: Implementation (SPARC Coder)
print_phase "5" "Implementation (SPARC Coder)"

execute_cmd 'rovo-code-flow sparc coder "Set up the React TypeScript project with Vite, configure Tailwind CSS, and set up the development environment"'

execute_cmd 'rovo-code-flow sparc coder "Implement the calculator engine with support for basic arithmetic, scientific functions, and expression parsing"'

execute_cmd 'rovo-code-flow sparc coder "Implement the main Calculator component with Display, Keypad, and Button components using TypeScript and Tailwind CSS"'

execute_cmd 'rovo-code-flow sparc coder "Implement Zustand store for calculator state, history management, and user preferences"'

execute_cmd 'rovo-code-flow sparc coder "Implement scientific calculator functions: trigonometry, logarithms, exponentials, and constants"'

execute_cmd 'rovo-code-flow sparc coder "Implement calculation history, memory functions (M+, M-, MR, MC), and persistent storage"'

execute_cmd 'rovo-code-flow sparc coder "Implement a dynamic theme system with light, dark, and custom themes using CSS variables"'

execute_cmd 'rovo-code-flow sparc coder "Implement comprehensive keyboard support with shortcuts for all calculator functions"'

execute_cmd 'rovo-code-flow sparc coder "Implement responsive design that works on desktop, tablet, and mobile devices"'

execute_cmd 'rovo-code-flow sparc coder "Implement accessibility features: ARIA labels, keyboard navigation, screen reader support"'

# Phase 6: Security Review (SPARC Security)
print_phase "6" "Security Review (SPARC Security)"

execute_cmd 'rovo-code-flow sparc security "Review input validation and sanitization to prevent injection attacks and malformed expressions"'

execute_cmd 'rovo-code-flow sparc security "Analyze client-side security including XSS prevention, secure storage, and data validation"'

execute_cmd 'rovo-code-flow sparc security "Audit all dependencies for known vulnerabilities and recommend security updates"'

execute_cmd 'rovo-code-flow sparc security "Review data handling practices, local storage security, and user privacy protection"'

# Phase 7: Multi-Agent Coordination (Swarms)
print_phase "7" "Multi-Agent Coordination (Swarms)"

execute_cmd 'rovo-code-flow swarm "Implement advanced calculator features: unit converter, graphing capability, and equation solver" --parallel --strategy implementation --max-agents 3'

execute_cmd 'rovo-code-flow swarm "Integrate all calculator components, run comprehensive testing, and prepare for deployment" --strategy development --max-agents 2'

execute_cmd 'rovo-code-flow swarm "Optimize calculator performance: bundle size, rendering speed, and memory usage" --parallel --strategy development --max-agents 2'

# Phase 8: DevOps and Deployment (SPARC DevOps)
print_phase "8" "DevOps and Deployment (SPARC DevOps)"

execute_cmd 'rovo-code-flow sparc devops "Set up CI/CD pipeline with GitHub Actions for automated testing, building, and deployment to Vercel/Netlify"'

execute_cmd 'rovo-code-flow sparc devops "Configure performance monitoring, error tracking, and analytics for the calculator application"'

execute_cmd 'rovo-code-flow sparc devops "Optimize the production build with code splitting, lazy loading, and CDN configuration"'

execute_cmd 'rovo-code-flow sparc devops "Automate deployment process with environment management, rollback capabilities, and health checks"'

# Phase 9: Agent Management and Coordination
print_phase "9" "Agent Management and Coordination"

execute_cmd "rovo-code-flow agent spawn calculator-engine-agent"
execute_cmd "rovo-code-flow agent spawn ui-component-agent"
execute_cmd "rovo-code-flow agent spawn testing-agent"

execute_cmd "rovo-code-flow agent list"

execute_cmd 'rovo-code-flow swarm "Add scientific graphing calculator with plot visualization" --parallel --max-agents 3'

# Phase 10: Memory and Knowledge Management
print_phase "10" "Memory and Knowledge Management"

execute_cmd 'rovo-code-flow memory add "Calculator uses the Command pattern for operations and Observer pattern for state updates" --repo'

execute_cmd 'rovo-code-flow memory add "Implemented memoization for complex calculations and virtual scrolling for history list" --repo'

execute_cmd 'rovo-code-flow memory add "All buttons have ARIA labels, keyboard shortcuts follow standard conventions, high contrast mode supported" --repo'

execute_cmd 'rovo-code-flow memory add "Unit tests cover 95% of calculator engine, E2E tests cover all user workflows, performance tests ensure <100ms response" --repo'

execute_cmd "rovo-code-flow memory list --repo"

# Phase 11: Advanced Features and Extensions
print_phase "11" "Advanced Features and Extensions"

execute_cmd 'rovo-code-flow sparc coder "Implement matrix calculator with operations for addition, multiplication, determinant, and inverse"'

execute_cmd 'rovo-code-flow sparc coder "Implement function graphing with zoom, pan, and multiple function plotting capabilities"'

execute_cmd 'rovo-code-flow sparc coder "Implement comprehensive unit converter for length, weight, temperature, currency, and more"'

execute_cmd 'rovo-code-flow sparc coder "Implement equation solver for linear, quadratic, and system of equations"'

execute_cmd 'rovo-code-flow sparc coder "Implement programmer calculator with binary, octal, hexadecimal operations and bitwise functions"'

# Phase 12: Quality Assurance and Optimization
print_phase "12" "Quality Assurance and Optimization"

execute_cmd 'rovo-code-flow sparc tdd "Create comprehensive test suite covering all calculator modes, edge cases, and user scenarios"'

execute_cmd 'rovo-code-flow sparc coder "Optimize calculator performance: lazy loading, code splitting, and efficient re-rendering"'

execute_cmd 'rovo-code-flow sparc tdd "Test and ensure compatibility across Chrome, Firefox, Safari, and Edge browsers"'

execute_cmd 'rovo-code-flow sparc coder "Optimize touch interactions, gesture support, and mobile-specific UI improvements"'

# Phase 13: Documentation and Maintenance
print_phase "13" "Documentation and Maintenance"

execute_cmd 'rovo-code-flow sparc architect "Create comprehensive technical documentation including API docs, component docs, and architecture diagrams"'

execute_cmd 'rovo-code-flow sparc coder "Create user guide with tutorials, keyboard shortcuts, and feature explanations"'

execute_cmd 'rovo-code-flow sparc devops "Create maintenance plan including update procedures, monitoring, and support workflows"'

# Phase 14: System Monitoring and Status
print_phase "14" "System Monitoring and Status"

execute_cmd "rovo-code-flow status"
execute_cmd "rovo-code-flow usage"
execute_cmd "rovo-code-flow sessions --list"

# Final Summary
echo -e "\n${GREEN}🎉 Modern Calculator Development Workflow Complete!${NC}"
echo "=============================================================="
echo -e "${BLUE}📊 Summary:${NC}"
echo "• ✅ Complete SPARC methodology implementation"
echo "• ✅ Full Event Modeling workflow"
echo "• ✅ Multi-agent coordination and swarms"
echo "• ✅ Comprehensive testing and security review"
echo "• ✅ DevOps pipeline and deployment automation"
echo "• ✅ Advanced features and optimizations"
echo "• ✅ Documentation and maintenance planning"
echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo "1. Review generated code and documentation"
echo "2. Run tests and validate functionality"
echo "3. Deploy to staging environment"
echo "4. Conduct user acceptance testing"
echo "5. Deploy to production"
echo ""
echo -e "${BLUE}💡 Pro Tips:${NC}"
echo "• Use 'rovo-code-flow interactive' for ongoing development"
echo "• Leverage 'rovo-code-flow memory list --repo' to review project knowledge"
echo "• Use 'rovo-code-flow sessions' to manage development workflows"
echo "• Run 'rovo-code-flow status' to monitor system health"