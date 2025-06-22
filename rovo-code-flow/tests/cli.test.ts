import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initCommand } from '../src/commands/init';
import { startCommand } from '../src/commands/start';
import { sparcCommand } from '../src/commands/sparc';
import { eventCommand } from '../src/commands/event';

// Mock console.log to avoid cluttering test output
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('CLI Commands', () => {
  describe('initCommand', () => {
    it('should initialize with default options when none provided', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      initCommand({});
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Initializing with default configuration'));
    });
    
    it('should initialize SPARC when specified', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      initCommand({ sparc: true });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Initializing rovo-code-flow"));
    });
    
    it('should initialize Event Modeling when specified', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      initCommand({ event: true });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Initializing rovo-code-flow"));
    });
  });
  
  describe('startCommand', () => {
    it('should start in CLI mode by default', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await startCommand({});
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Starting in CLI mode'));
    });
    
    it('should start UI with specified port', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await startCommand({ ui: true, port: '4000' });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Starting UI on port 4000'));
    });
  });
  
  describe('sparcCommand', () => {
    it('should run SPARC agent with specified mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      sparcCommand('coder', 'Build API');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Running SPARC agent in coder mode'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Task: Build API'));
    });
    
    it('should warn about non-standard SPARC mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      sparcCommand('nonstandard', 'Test task');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Warning'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not a standard SPARC mode'));
    });
  });
  
  describe('eventCommand', () => {
    it('should run Event Modeling agent with specified role', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      eventCommand('modeler', 'Model user flow');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Running Event Modeling agent with modeler role'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Task: Model user flow'));
    });
    
    it('should warn about non-standard Event Modeling role', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      eventCommand('nonstandard', 'Test task');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Warning'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not a standard Event Modeling role'));
    });
  });
});