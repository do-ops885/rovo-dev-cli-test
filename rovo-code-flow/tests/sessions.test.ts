import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionsCommand } from '../src/commands/sessions';
import fs from 'fs';
import path from 'path';
import os from 'os';
import * as utils from '../src/utils';

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn()
}));

// Mock utils
vi.mock('../src/utils', () => ({
  getSessionFiles: vi.fn(),
  getSessionDetails: vi.fn()
}));

// Mock inquirer
vi.mock('inquirer', () => ({
  prompt: vi.fn()
}));

describe('sessionsCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('listSessions', () => {
    it('should show a message if no sessions are found', async () => {
      (utils.getSessionFiles as vi.Mock).mockReturnValue([]);
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      await sessionsCommand();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No sessions found'));
    });
    
    it('should list sessions if they exist', async () => {
      const mockSessionFiles = [
        path.join(os.homedir(), '.rovodev', 'sessions', 'session1.json'),
        path.join(os.homedir(), '.rovodev', 'sessions', 'session2.json')
      ];
      
      (utils.getSessionFiles as vi.Mock).mockReturnValue(mockSessionFiles);
      
      (utils.getSessionDetails as vi.Mock).mockImplementation((file) => {
        const id = path.basename(file, '.json');
        return {
          id,
          title: `Session ${id}`,
          created: new Date(),
          updated: new Date(),
          messages: 5
        };
      });
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      await sessionsCommand();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available sessions'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('session1'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('session2'));
    });
  });
  
  describe('clearSession', () => {
    it('should clear the current session if confirmed', async () => {
      // Mock inquirer prompt
      const inquirer = require('inquirer');
      (inquirer.prompt as vi.Mock).mockResolvedValue({ confirm: true });
      
      // Mock session files and details
      const mockSessionFile = path.join(os.homedir(), '.rovodev', 'sessions', 'session1.json');
      (utils.getSessionFiles as vi.Mock).mockReturnValue([mockSessionFile]);
      (utils.getSessionDetails as vi.Mock).mockReturnValue({
        id: 'session1',
        title: 'Session 1',
        created: new Date(),
        updated: new Date(),
        messages: 5
      });
      
      // Mock fs.readFileSync and fs.writeFileSync
      (fs.readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
        messages: [{ role: 'user', content: 'test' }]
      }));
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      await sessionsCommand({ clear: true });
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockSessionFile,
        expect.stringContaining('"messages":[]')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('has been cleared'));
    });
  });
});