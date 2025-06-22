import { describe, it, expect, vi, beforeEach } from 'vitest';
import { instructionsCommand } from '../src/commands/instructions';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { AcliIntegration } from '../src/acli-integration';

// Mock fs
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn()
  },
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn()
}));

// Mock AcliIntegration
vi.mock('../src/acli-integration', () => ({
  AcliIntegration: vi.fn().mockImplementation(() => ({
    initRovoDev: vi.fn().mockResolvedValue(true),
    runWithInstruction: vi.fn().mockResolvedValue(true)
  }))
}));

// Mock inquirer
const mockInquirerPrompt = vi.fn();
vi.mock('inquirer', () => ({
  prompt: mockInquirerPrompt
}));

// Mock yaml
const mockParse = vi.fn();
const mockStringify = vi.fn();
vi.mock('yaml', () => ({
  parse: mockParse,
  stringify: mockStringify
}));

describe('instructionsCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('listInstructions', () => {
    it('should show a message if no instructions are found', async () => {
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      
      mockParse.mockReturnValue({ instructions: [] });
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      await instructionsCommand();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No instructions found'));
    });
    
    it('should list instructions if they exist', async () => {
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      
      mockParse.mockReturnValue({
        instructions: [
          { name: 'Instruction 1', prompt: 'Test prompt 1' },
          { name: 'Instruction 2', prompt: 'Test prompt 2' }
        ]
      });
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      await instructionsCommand();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Saved instructions'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Instruction 1'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Instruction 2'));
    });
  });
  
  describe('addInstruction', () => {
    it('should add a new instruction', async () => {
      // Mock inquirer prompt
      mockInquirerPrompt.mockResolvedValue({
        name: 'Test Instruction',
        prompt: 'Test prompt'
      });
      
      // Mock fs and yaml
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      
      const yaml = require('yaml');
      (yaml.parse as vi.Mock).mockReturnValue({
        instructions: []
      });
      
      await instructionsCommand({ add: true });
      
      expect(mockStringify).toHaveBeenCalledWith({
        instructions: [
          { name: 'Test Instruction', prompt: 'Test prompt' }
        ]
      });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
  
  describe('runInstruction', () => {
    it('should run an instruction', async () => {
      // Mock fs and yaml
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      
      mockParse.mockReturnValue({
        instructions: [
          { name: 'Test Instruction', prompt: 'Test prompt' }
        ]
      });
      
      await instructionsCommand({ run: 'Test Instruction' });
      
      const acliInstance = new AcliIntegration();
      expect(acliInstance.runWithInstruction).toHaveBeenCalledWith('Test prompt');
    });
  });
});