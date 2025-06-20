import chalk from 'chalk';
import { Orchestrator } from '../orchestrator';
import { McpManager } from '../mcp-manager';
import { getDailyTokenUsage, formatTokenUsage, formatDuration } from '../utils';
import os from 'os';
import { getSessionFiles, getSessionDetails } from '../utils';

export function statusCommand(): void {
  console.log(chalk.green('System Status:'));
  
  // Check orchestrator status
  const orchestrator = new Orchestrator();
  const isActive = orchestrator.isActive();
  const agents = orchestrator.getAgents();
  
  console.log(chalk.blue(`Orchestrator: ${isActive ? chalk.green('Active') : chalk.red('Inactive')}`));
  console.log(chalk.blue(`Active Agents: ${agents.size}`));
  
  // Display agent details if any are active
  if (agents.size > 0) {
    console.log(chalk.blue('\nActive Agents:'));
    
    agents.forEach((agent, name) => {
      console.log(`- ${name} (${agent.type}, ${agent.status})`);
    });
  }
  
  // Check MCP server status
  const mcpManager = new McpManager();
  const runningServers = mcpManager.getRunningServers();
  
  console.log(chalk.blue(`\nMCP Servers: ${runningServers.length} running`));
  
  if (runningServers.length > 0) {
    console.log(chalk.blue('Running MCP Servers:'));
    
    runningServers.forEach(name => {
      console.log(`- ${name}`);
    });
  }
  
  // Get system metrics
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100;
  
  console.log(chalk.blue('\nSystem Metrics:'));
  console.log(`Memory Usage: ${heapUsedMB} MB / ${heapTotalMB} MB`);
  console.log(`Platform: ${os.platform()} ${os.release()}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`CPU Cores: ${os.cpus().length}`);
  
  // Get uptime
  const uptimeMs = process.uptime() * 1000;
  console.log(`Uptime: ${formatDuration(uptimeMs)}`);
  
  // Get token usage
  const { used, limit } = getDailyTokenUsage();
  console.log(chalk.blue('\nToken Usage:'));
  console.log(`Daily Usage: ${formatTokenUsage(used, limit)}`);
  
  // Get session information
  const sessionFiles = getSessionFiles();
  console.log(chalk.blue('\nSessions:'));
  console.log(`Total Sessions: ${sessionFiles.length}`);
  
  if (sessionFiles.length > 0) {
    const sessions = sessionFiles
      .map(file => getSessionDetails(file))
      .filter(session => session !== null)
      .sort((a, b) => b.updated.getTime() - a.updated.getTime());
    
    if (sessions.length > 0) {
      const currentSession = sessions[0];
      console.log(`Current Session: ${currentSession.title} (${currentSession.messages} messages)`);
      console.log(`Last Activity: ${currentSession.updated.toLocaleString()}`);
    }
  }
}