import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryFileManager } from '../src/memory-file';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
  statSync: vi.fn(),
  readdirSync: vi.fn()
}));

describe('MemoryFileManager', () => {
  let memoryManager: MemoryFileManager;
  
  beforeEach(() => {
    memoryManager = new MemoryFileManager();
    vi.clearAllMocks();
  });
  
  describe('initMemoryFiles', () => {
    it('should create global and local memory files if they do not exist', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      
      await memoryManager.initMemoryFiles();
      
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(os.homedir(), '.agent.md'),
        expect.any(String)
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '.agent.local.md'),
        expect.any(String)
      );
    });
    
    it('should not overwrite existing memory files', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      
      await memoryManager.initMemoryFiles();
      
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });
  
  describe('addNote', () => {
    it('should create file with note if it does not exist', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      
      const result = await memoryManager.addNote('Test note', 'local');
      
      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '.agent.local.md'),
        expect.stringContaining('Test note')
      );
    });
    
    it('should append note to existing file', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      (fs.readFileSync as vi.Mock).mockReturnValue('Existing content');
      
      const result = await memoryManager.addNote('Test note', 'local');
      
      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '.agent.local.md'),
        'Existing content\nTest note\n'
      );
    });
  });
  
  describe('removeNote', () => {
    it('should return false if file does not exist', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      
      const result = await memoryManager.removeNote('Test note', 'local');
      
      expect(result).toBe(false);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    
    it('should return false if note not found', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      (fs.readFileSync as vi.Mock).mockReturnValue('Existing content');
      
      const result = await memoryManager.removeNote('Test note', 'local');
      
      expect(result).toBe(false);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    
    it('should remove note if found', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      (fs.readFileSync as vi.Mock).mockReturnValue('Line 1\nTest note line\nLine 3');
      
      const result = await memoryManager.removeNote('Test note', 'local');
      
      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '.agent.local.md'),
        expect.not.stringContaining('Test note line')
      );
    });
  });
  
  describe('initWithRepoInfo', () => {
    it('should create repository memory file with structure info', async () => {
      // Mock fs functions
      (fs.existsSync as vi.Mock).mockImplementation((path) => {
        if (path.includes('package.json')) {
          return true;
        }
        return false;
      });
      
      (fs.readFileSync as vi.Mock).mockImplementation((path) => {
        if (path.includes('package.json')) {
          return JSON.stringify({
            name: 'test-project',
            description: 'Test project',
            version: '1.0.0',
            dependencies: {
              typescript: '^4.0.0',
              react: '^17.0.0'
            }
          });
        }
        return '';
      });
      
      (fs.readdirSync as vi.Mock).mockReturnValue(['src', 'tests', 'package.json']);
      (fs.statSync as vi.Mock).mockImplementation((path) => ({
        isDirectory: () => path.includes('src') || path.includes('tests')
      }));
      
      const result = await memoryManager.initWithRepoInfo();
      
      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '.agent.local.md'),
        expect.stringContaining('Repository Structure')
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '.agent.local.md'),
        expect.stringContaining('typescript, react')
      );
    });
  });
});