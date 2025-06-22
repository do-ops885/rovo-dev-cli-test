import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpManager } from '../src/mcp-manager';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

// Mock fs
vi.mock('fs', () => {
  return {
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
  };
});

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

describe('McpManager', () => {
  let mcpManager: McpManager;
  const mockSpawn = spawn as unknown as vi.Mock;
  const testConfigPath = path.join(os.tmpdir(), 'test-mcp.json');
  
  beforeEach(() => {
    vi.clearAllMocks();
    mcpManager = new McpManager(testConfigPath);
  });
  
  describe('constructor', () => {
    it('should load config if it exists', () => {
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      (fs.readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
        "test-server": {
          "command": "test",
          "args": ["arg1", "arg2"]
        }
      }));
      
      mcpManager = new McpManager(testConfigPath);
      
      expect(fs.readFileSync).toHaveBeenCalledWith(
        testConfigPath,
        'utf8'
      );
    });
    
    it('should create default config if it does not exist', () => {
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      
      mcpManager = new McpManager(testConfigPath);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        testConfigPath,
        expect.stringContaining('web-fetcher')
      );
    });
  });
  
  describe('addServer', () => {
    it('should add a new server to the config', () => {
      mcpManager.addServer('test-server', 'test-command', ['arg1', 'arg2']);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        testConfigPath,
        expect.stringContaining('test-server')
      );
    });
  });
  
  describe('removeServer', () => {
    it('should remove a server from the config', () => {
      // Setup initial config
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      (fs.readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
        "test-server": {
          "command": "test",
          "args": ["arg1", "arg2"]
        }
      }));
      
      mcpManager = new McpManager(testConfigPath);
      
      const result = mcpManager.removeServer('test-server');
      
      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
    
    it('should return false if server does not exist', () => {
      const result = mcpManager.removeServer('non-existent-server');
      
      expect(result).toBe(false);
    });
  });
  
  describe('startServer', () => {
    it('should start a server', () => {
      // Setup mock spawn
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn()
      };
      mockSpawn.mockReturnValue(mockProcess);
      
      // Setup initial config
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      (fs.readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
        "test-server": {
          "command": "test",
          "args": ["arg1", "arg2"]
        }
      }));
      
      mcpManager = new McpManager(testConfigPath);
      
      const result = mcpManager.startServer('test-server');
      
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('test', ['arg1', 'arg2'], expect.any(Object));
    });
    
    it('should return false if server does not exist', () => {
      const result = mcpManager.startServer('non-existent-server');
      
      expect(result).toBe(false);
    });
  });
});