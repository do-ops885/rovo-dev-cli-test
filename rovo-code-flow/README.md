# Rovo Code Flow

Multi-agent orchestration CLI for Rovo Dev, blending SPARC and Event Modeling methodologies for advanced AI-powered development workflows.

## Features

- **Agent Orchestration**: Combine SPARC modes and Event Modeling roles
- **Seamless Integration**: Works with Atlassian/Rovo Dev ecosystem
- **Natural Language Commands**: Drive code, documentation, and project management with plain English
- **Memory and Knowledge Bank**: Store and retrieve project knowledge
- **Enterprise Features**: Project/deployment management, analytics, compliance
- **Concurrency Control**: Prevent concurrent file edits by multiple agents with distributed locking

## Installation

```bash
# Install globally
npm install -g rovo-code-flow

# Or use with npx
npx rovo-code-flow <command>
```

## Usage

### ACLI Integration

```bash
# Install and setup Rovo Dev for ACLI
rovo-code-flow acli setup

# Install Rovo Dev for ACLI
rovo-code-flow acli install

# Authenticate with Atlassian account
rovo-code-flow acli auth

# Run Rovo Dev in interactive mode
rovo-code-flow acli run

# Run Rovo Dev with a specific instruction
rovo-code-flow acli run --instruction "Explain this repository to me"
```

### Initialize

```bash
# Initialize with both SPARC and Event Modeling
rovo-code-flow init --sparc --event
```

### Start Orchestrator

```bash
# Start in CLI mode
rovo-code-flow start

# Start with UI
rovo-code-flow start --ui --port 3000
```

### Check Status

```bash
rovo-code-flow status
```

### Run SPARC Agent

```bash
# Run SPARC coder agent
rovo-code-flow sparc coder "implement user login"

# Run SPARC architect agent
rovo-code-flow sparc architect "design authentication system"
```

### Run Event Modeling Agent

```bash
# Run Event Modeling modeler agent
rovo-code-flow event modeler "model password reset flow"

# Run Event Modeling UI mapper agent
rovo-code-flow event ui "map user registration screens"
```

### Agent Management

```bash
# Spawn a new agent
rovo-code-flow agent spawn researcher

# List all agents
rovo-code-flow agent list

# Kill an agent
rovo-code-flow agent kill researcher
```

### Memory Operations

```bash
# Initialize memory file with repository information
rovo-code-flow memory init

# Add a note to local memory file
rovo-code-flow memory add "Follow camelCase naming convention for variables"

# Add a note to global memory file
rovo-code-flow memory add "Always include error handling" --global

# Add a note to repository memory file
rovo-code-flow memory add "Use TypeScript for all new files" --repo

# Show contents of local memory file
rovo-code-flow memory show

# Show contents of global memory file
rovo-code-flow memory show --global

# Remove a note from memory file
rovo-code-flow memory remove "naming convention"
```

### Multi-agent Swarm

```bash
# Run a swarm of agents
rovo-code-flow swarm "Build dashboard" --strategy development --max-agents 4 --parallel
```

### Token Usage

```bash
# Show daily token usage
rovo-code-flow usage
```

### Session Management

```bash
# List all sessions
rovo-code-flow sessions

# Clear the current session
rovo-code-flow sessions --clear

# Prune the current session to reduce token usage
rovo-code-flow sessions --prune

# Switch to a different session
rovo-code-flow sessions --switch <session-id>
```

### Instructions Management

```bash
# List all saved instructions
rovo-code-flow instructions

# Add a new instruction
rovo-code-flow instructions --add

# Remove an instruction
rovo-code-flow instructions --remove <name>

# Run a saved instruction
rovo-code-flow instructions --run <name>
```

### Interactive Mode

```bash
# Start interactive mode
rovo-code-flow interactive

# Start interactive mode with an initial prompt
rovo-code-flow interactive --prompt "Explain this repository"
```

### MCP Server Management

```bash
# List all MCP servers
rovo-code-flow mcp list

# Start an MCP server
rovo-code-flow mcp start --start <name>

# Stop an MCP server
rovo-code-flow mcp stop --stop <name>

# Add a new MCP server
rovo-code-flow mcp add

# Remove an MCP server
rovo-code-flow mcp remove --remove <name>
```

### Feedback

```bash
# Provide feedback or report a bug
rovo-code-flow feedback

# Report a bug
rovo-code-flow feedback --bug

# Request a feature
rovo-code-flow feedback --feature
```

## SPARC Modes

- `architect`: System architecture and design
- `coder`: Implementation and coding
- `tdd`: Test-driven development
- `security`: Security analysis and hardening
- `devops`: Deployment and operations

## Event Modeling Roles

- `modeler`: Core event modeling
- `timeline`: Event timeline planning
- `ui`: UI/UX mapping
- `state`: State modeling
- `mapper`: System mapping

## Development

```bash
# Clone the repository
git clone https://github.com/your-username/rovo-code-flow.git
cd rovo-code-flow

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## License

ISC

## File Locking System

To prevent concurrent file edits by multiple agents, Rovo Code Flow implements a distributed locking mechanism:

- **Dual-layer Locking**: Uses both memory and filesystem for redundancy
- **Agent-specific Locks**: Each lock is associated with the agent that acquired it
- **Automatic Cleanup**: Expired locks are automatically cleaned up
- **Conflict Resolution**: Uses exponential backoff for retry attempts

Agents automatically acquire locks before writing to files and release them afterward, ensuring data integrity in multi-agent scenarios.

### Usage in Agent Implementation

```typescript
// Example of using file locking in an agent
async function writeToFile(filePath: string, content: string) {
  // Acquire lock before writing
  const lockAcquired = await this.acquireFileLock(filePath);
  
  if (!lockAcquired) {
    console.log(`Failed to acquire lock for ${filePath}`);
    return false;
  }
  
  try {
    // Write to file
    fs.writeFileSync(filePath, content);
    return true;
  } finally {
    // Always release lock when done
    await this.releaseFileLock(filePath);
  }
}
```