import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcliIntegration } from '../src/acli-integration';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

// Mock child_process.spawn
vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

// Mock fs
vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
      readFileSync: vi.fn().mockReturnValue('{}')
    },
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue('{}')
  };
});

describe('AcliIntegration', () => {
  let acli: AcliIntegration;
  const mockSpawn = spawn as unknown as vi.Mock;
  const testConfigPath = path.join(os.tmpdir(), 'test-rovodev');
  
  beforeEach(() => {
    acli = new AcliIntegration({}, testConfigPath);
    vi.clearAllMocks();
  });
  
  describe('isAcliInstalled', () => {
    it('should return true if ACLI is installed', async () => {
      // Mock successful spawn
      const mockOn = vi.fn((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
        return { on: mockOn };
      });
      
      mockSpawn.mockReturnValue({
        on: mockOn
      });
      
      const result = await acli.isAcliInstalled();
      
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('acli', ['--version']);
    });
    
    it('should return false if ACLI is not installed', async () => {
      // Mock failed spawn
      const mockOn = vi.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error('Command not found'));
        }
        return { on: mockOn };
      });
      
      mockSpawn.mockReturnValue({
        on: mockOn
      });
      
      const result = await acli.isAcliInstalled();
      
      expect(result).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith('acli', ['--version']);
    });
  });
  
  describe('initRovoDev', () => {
    it('should create necessary directories and files', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      
      const result = await acli.initRovoDev();
      
      expect(result).toBe(true);
      expect(fs.mkdirSync).toHaveBeenCalledWith(testConfigPath, { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledTimes(3); // config.yml, instructions.yml, mcp.json
    });
    
    it('should not overwrite existing files', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      
      const result = await acli.initRovoDev();
      
      expect(result).toBe(true);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });
  
  describe('authLogin', () => {
    it('should run ACLI auth login command', async () => {
      // Mock successful spawn
      const mockOn = vi.fn((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
        return { on: mockOn };
      });
      
      mockSpawn.mockReturnValue({
        on: mockOn
      });
      
      const result = await acli.authLogin();
      
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('acli', ['rovodev', 'auth', 'login'], { stdio: 'inherit' });
    });
  });
  
  describe('runInteractive', () => {
    it('should run ACLI in interactive mode', async () => {
      // Mock successful spawn
      const mockOn = vi.fn((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
        return { on: mockOn };
      });
      
      mockSpawn.mockReturnValue({
        on: mockOn
      });
      
      const result = await acli.runInteractive();
      
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('acli', ['rovodev', 'run'], { stdio: 'inherit' });
    });
  });
  
  describe('runWithInstruction', () => {
    it('should run ACLI with a specific instruction', async () => {
      // Mock successful spawn
      const mockOn = vi.fn((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
        return { on: mockOn };
      });
      
      const mockStdout = {
        on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback('Test output');
          }
        })
      };
      
      const mockStderr = {
        on: vi.fn()
      };
      
      mockSpawn.mockReturnValue({
        on: mockOn,
        stdout: mockStdout,
        stderr: mockStderr
      });
      
      const result = await acli.runWithInstruction('Explain this repository');
      
      expect(typeof result).toBe('string');
      expect(mockSpawn).toHaveBeenCalledWith('acli', ['rovodev', 'run', 'Explain this repository'], { stdio: ['inherit', 'pipe', 'pipe'] });
    });
  });
});