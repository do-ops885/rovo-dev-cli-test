import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionsCommand } from '../src/commands/sessions';
import fs from 'fs';
import path from 'path';
import os from 'os';
import * as utils from '../src/utils';
import inquirer from 'inquirer';

// Mock modules
vi.mock('fs');
vi.mock('../src/utils');
vi.mock('inquirer');

// Setup mocks
const mockInquirerPrompt = vi.fn();
const mockGetSessionFiles = vi.fn();
const mockGetSessionDetails = vi.fn();
const mockReadFileSync = vi.fn();
const mockWriteFileSync = vi.fn();

// Configure mocks
vi.mocked(inquirer.prompt).mockImplementation(mockInquirerPrompt);
vi.mocked(utils.getSessionFiles).mockImplementation(mockGetSessionFiles);
vi.mocked(utils.getSessionDetails).mockImplementation(mockGetSessionDetails);
vi.mocked(fs.readFileSync).mockImplementation(mockReadFileSync);
vi.mocked(fs.writeFileSync).mockImplementation(mockWriteFileSync);

describe('sessionsCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('listSessions', () => {
    it('should show a message if no sessions are found', async () => {
      mockGetSessionFiles.mockReturnValue([]);
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      await sessionsCommand();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No sessions found'));
    });
    
    it('should list sessions if they exist', async () => {
      const mockSessionFiles = [
        path.join(os.homedir(), '.rovodev', 'sessions', 'session1.json'),
        path.join(os.homedir(), '.rovodev', 'sessions', 'session2.json')
      ];
      
      mockGetSessionFiles.mockReturnValue(mockSessionFiles);
      
      mockGetSessionDetails.mockImplementation((file) => {
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
      mockInquirerPrompt.mockResolvedValue({ confirm: true });
      
      // Mock session files and details
      const mockSessionFile = path.join(os.homedir(), '.rovodev', 'sessions', 'session1.json');
      mockGetSessionFiles.mockReturnValue([mockSessionFile]);
      mockGetSessionDetails.mockReturnValue({
        id: 'session1',
        title: 'Session 1',
        created: new Date(),
        updated: new Date(),
        messages: 5
      });
      
      // Mock fs.readFileSync
      mockReadFileSync.mockReturnValue(JSON.stringify({
        messages: [{ role: 'user', content: 'test' }]
      }));
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      await sessionsCommand({ clear: true });
      
      // Check that writeFileSync was called with the correct file path
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        mockSessionFile,
        expect.any(String)
      );
      
      // Check that the content contains empty messages array
      const writeFileCall = mockWriteFileSync.mock.calls[0];
      expect(writeFileCall[1]).toContain('"messages":');
      expect(writeFileCall[1]).toContain('[]');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('has been cleared'));
    });
  });
});