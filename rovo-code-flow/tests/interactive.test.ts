import { describe, it, expect, vi, beforeEach } from 'vitest';
import { interactiveCommand } from '../src/commands/interactive';
import { AcliIntegration } from '../src/acli-integration';
import { MemoryFileManager } from '../src/memory-file';
import inquirer from 'inquirer';
import { sessionsCommand } from '../src/commands/sessions';
import { instructionsCommand } from '../src/commands/instructions';
import { usageCommand } from '../src/commands/usage';
import { feedbackCommand } from '../src/commands/feedback';

// Mock all modules
vi.mock('../src/acli-integration');
vi.mock('../src/memory-file');
vi.mock('inquirer');
vi.mock('../src/commands/sessions');
vi.mock('../src/commands/instructions');
vi.mock('../src/commands/usage');
vi.mock('../src/commands/feedback');

// Setup mocks
const mockInquirerPrompt = vi.fn();
const mockAcliRunWithInstruction = vi.fn().mockResolvedValue(true);
const mockMemoryAddNote = vi.fn().mockResolvedValue(true);
const mockMemoryRemoveNote = vi.fn().mockResolvedValue(true);

// Configure mocks
vi.mocked(inquirer.prompt).mockImplementation(mockInquirerPrompt);
vi.mocked(AcliIntegration).mockImplementation(() => ({
  runWithInstruction: mockAcliRunWithInstruction
}));
vi.mocked(MemoryFileManager).mockImplementation(() => ({
  addNote: mockMemoryAddNote,
  removeNote: mockMemoryRemoveNote,
  initWithRepoInfo: vi.fn().mockResolvedValue(true)
}));

describe('interactiveCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should run initial prompt if provided', async () => {
    // Mock inquirer to exit after first prompt
    mockInquirerPrompt.mockResolvedValueOnce({ input: '/exit' });
    
    await interactiveCommand({ initialPrompt: 'Test prompt' });
    
    expect(mockAcliRunWithInstruction).toHaveBeenCalledWith('Test prompt');
  });
  
  it('should handle command with / prefix', async () => {
    // First prompt returns a command, second prompt exits
    mockInquirerPrompt
      .mockResolvedValueOnce({ input: '/help' })
      .mockResolvedValueOnce({ input: '/exit' });
    
    const consoleLogSpy = vi.spyOn(console, 'log');
    await interactiveCommand();
    
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available commands'));
  });
  
  it('should handle memory note with # prefix', async () => {
    // First prompt adds a note, second prompt exits
    mockInquirerPrompt
      .mockResolvedValueOnce({ input: '# Test note' })
      .mockResolvedValueOnce({ input: '/exit' });
    
    await interactiveCommand();
    
    expect(mockMemoryAddNote).toHaveBeenCalledWith('Test note', 'local');
  });
  
  it('should handle memory note removal with #! prefix', async () => {
    // First prompt removes a note, second prompt exits
    mockInquirerPrompt
      .mockResolvedValueOnce({ input: '#! Test note' })
      .mockResolvedValueOnce({ input: '/exit' });
    
    await interactiveCommand();
    
    expect(mockMemoryRemoveNote).toHaveBeenCalledWith('Test note', 'local');
  });
  
  it('should run regular prompt', async () => {
    // First prompt is a regular prompt, second prompt exits
    mockInquirerPrompt
      .mockResolvedValueOnce({ input: 'Test regular prompt' })
      .mockResolvedValueOnce({ input: '/exit' });
    
    await interactiveCommand();
    
    expect(mockAcliRunWithInstruction).toHaveBeenCalledWith('Test regular prompt');
  });
});