import { describe, it, expect, vi, beforeEach } from 'vitest';
import { interactiveCommand } from '../src/commands/interactive';
import { AcliIntegration } from '../src/acli-integration';
import { MemoryFileManager } from '../src/memory-file';

// Mock AcliIntegration
vi.mock('../src/acli-integration', () => ({
  AcliIntegration: vi.fn().mockImplementation(() => ({
    runWithInstruction: vi.fn().mockResolvedValue(true)
  }))
}));

// Mock MemoryFileManager
vi.mock('../src/memory-file', () => ({
  MemoryFileManager: vi.fn().mockImplementation(() => ({
    addNote: vi.fn().mockResolvedValue(true),
    removeNote: vi.fn().mockResolvedValue(true),
    initWithRepoInfo: vi.fn().mockResolvedValue(true)
  }))
}));

// Mock inquirer
vi.mock('inquirer', () => ({
  prompt: vi.fn()
}));

// Mock command handlers
vi.mock('../src/commands/sessions', () => ({
  sessionsCommand: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../src/commands/instructions', () => ({
  instructionsCommand: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../src/commands/usage', () => ({
  usageCommand: vi.fn()
}));

vi.mock('../src/commands/feedback', () => ({
  feedbackCommand: vi.fn().mockResolvedValue(undefined)
}));

describe('interactiveCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should run initial prompt if provided', async () => {
    const inquirer = require('inquirer');
    // Mock inquirer to exit after first prompt
    (inquirer.prompt as vi.Mock).mockResolvedValueOnce({ input: '/exit' });
    
    await interactiveCommand({ initialPrompt: 'Test prompt' });
    
    const acliInstance = new AcliIntegration();
    expect(acliInstance.runWithInstruction).toHaveBeenCalledWith('Test prompt');
  });
  
  it('should handle command with / prefix', async () => {
    const inquirer = require('inquirer');
    // First prompt returns a command, second prompt exits
    (inquirer.prompt as vi.Mock)
      .mockResolvedValueOnce({ input: '/help' })
      .mockResolvedValueOnce({ input: '/exit' });
    
    const consoleLogSpy = vi.spyOn(console, 'log');
    await interactiveCommand();
    
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available commands'));
  });
  
  it('should handle memory note with # prefix', async () => {
    const inquirer = require('inquirer');
    // First prompt adds a note, second prompt exits
    (inquirer.prompt as vi.Mock)
      .mockResolvedValueOnce({ input: '# Test note' })
      .mockResolvedValueOnce({ input: '/exit' });
    
    await interactiveCommand();
    
    const memoryManager = new MemoryFileManager();
    expect(memoryManager.addNote).toHaveBeenCalledWith('Test note', 'local');
  });
  
  it('should handle memory note removal with #! prefix', async () => {
    const inquirer = require('inquirer');
    // First prompt removes a note, second prompt exits
    (inquirer.prompt as vi.Mock)
      .mockResolvedValueOnce({ input: '#! Test note' })
      .mockResolvedValueOnce({ input: '/exit' });
    
    await interactiveCommand();
    
    const memoryManager = new MemoryFileManager();
    expect(memoryManager.removeNote).toHaveBeenCalledWith('Test note', 'local');
  });
  
  it('should run regular prompt', async () => {
    const inquirer = require('inquirer');
    // First prompt is a regular prompt, second prompt exits
    (inquirer.prompt as vi.Mock)
      .mockResolvedValueOnce({ input: 'Test regular prompt' })
      .mockResolvedValueOnce({ input: '/exit' });
    
    await interactiveCommand();
    
    const acliInstance = new AcliIntegration();
    expect(acliInstance.runWithInstruction).toHaveBeenCalledWith('Test regular prompt');
  });
});