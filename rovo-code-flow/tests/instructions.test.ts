import { describe, it, expect, vi, beforeEach } from 'vitest';
import { instructionsCommand } from '../src/commands/instructions';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { AcliIntegration } from '../src/acli-integration';
import inquirer from 'inquirer';
import yaml from 'yaml';

// Mock modules
vi.mock('fs');
vi.mock('inquirer');
vi.mock('yaml');
vi.mock('../src/acli-integration');

// Setup mocks
const mockInquirerPrompt = vi.fn();
const mockYamlParse = vi.fn();
const mockYamlStringify = vi.fn();
const mockAcliRunWithInstruction = vi.fn().mockResolvedValue(true);

// Configure mocks
vi.mocked(inquirer.prompt).mockImplementation(mockInquirerPrompt);
vi.mocked(yaml.parse).mockImplementation(mockYamlParse);
vi.mocked(yaml.stringify).mockImplementation(mockYamlStringify);
vi.mocked(AcliIntegration).mockImplementation(() => ({
  initRovoDev: vi.fn().mockResolvedValue(true),
  runWithInstruction: mockAcliRunWithInstruction
}));

describe('instructionsCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('listInstructions', () => {
    it('should show a message if no instructions are found', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockYamlParse.mockReturnValue({ instructions: [] });
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      await instructionsCommand();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No instructions found'));
    });
    
    it('should list instructions if they exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockYamlParse.mockReturnValue({
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
      const { prompt } = require('inquirer');
      prompt.mockResolvedValue({
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
      
      const { stringify } = require('yaml');
      expect(stringify).toHaveBeenCalledWith({
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
      
      const { parse } = require('yaml');
      parse.mockReturnValue({
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