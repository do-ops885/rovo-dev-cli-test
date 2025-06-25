# Modern Calculator Architecture

## Overview
This document presents a comprehensive modern calculator architecture built with React, TypeScript, and cutting-edge web technologies. The architecture emphasizes modularity, performance, accessibility, and extensibility.

## Executive Summary

### Vision
Create a world-class calculator application that serves as a reference implementation for modern web development practices, combining mathematical precision with exceptional user experience.

### Key Differentiators
- **Modular Plugin System**: Extensible architecture for custom functions and themes
- **Advanced State Management**: Zustand-based stores with optimized performance
- **Accessibility First**: WCAG 2.1 AA compliance with comprehensive screen reader support
- **Progressive Web App**: Offline functionality with native app-like experience
- **Type-Safe Development**: Full TypeScript coverage with strict type checking
- **Performance Optimized**: Sub-second load times with efficient rendering

## Architecture Overview

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  React Components │ Theme System │ Animation Engine │ PWA   │
├─────────────────────────────────────────────────────────────┤
│                   Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│ State Management │ Event Handling │ Plugin Manager │ Router │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                            │
├─────────────────────────────────────────────────────────────┤
│ Math Engine │ Expression Parser │ Function Registry │ Types │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                       │
├─────────────────────────────────────────────────────────────┤
│ Storage │ Networking │ Performance │ Security │ Monitoring   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Core Framework
- **React 18.2+**: Latest React with concurrent features
- **TypeScript 5.0+**: Strict type checking and latest language features
- **Vite 4.0+**: Lightning-fast build tool with HMR
- **Tailwind CSS 3.3+**: Utility-first CSS framework

#### State Management
- **Zustand 4.3+**: Lightweight state management
- **Immer 10.0+**: Immutable state updates
- **React Query 4.0+**: Server state management (future cloud features)

#### Development Tools
- **ESLint 8.0+**: Code linting with strict rules
- **Prettier 2.8+**: Code formatting
- **Husky 8.0+**: Git hooks for quality gates
- **Commitizen**: Conventional commit messages

#### Testing Framework
- **Vitest 0.32+**: Fast unit testing
- **Testing Library**: React component testing
- **Playwright 1.35+**: End-to-end testing
- **MSW 1.2+**: API mocking

#### Build and Deployment
- **Vite**: Build optimization and bundling
- **Workbox**: Service worker and PWA features
- **GitHub Actions**: CI/CD pipeline
- **Vercel/Netlify**: Static hosting with edge functions

## Component Architecture Deep Dive

### Component Hierarchy
```typescript
interface ComponentHierarchy {
  App: {
    providers: ['ThemeProvider', 'ErrorBoundary', 'PerformanceMonitor'];
    children: ['CalculatorShell'];
  };
  
  CalculatorShell: {
    layout: 'responsive-grid';
    children: ['Header', 'MainContent', 'Sidebar?', 'Footer'];
  };
  
  MainContent: {
    children: ['Display', 'ButtonGrid', 'StatusBar'];
  };
  
  ButtonGrid: {
    dynamic: true;
    children: ['CalculatorButton[]'];
    layouts: ['basic', 'scientific', 'programmer', 'financial'];
  };
}
```

### Advanced Component Patterns

#### 1. Compound Components
```typescript
// Calculator.tsx - Main compound component
const Calculator = {
  Root: CalculatorRoot,
  Display: CalculatorDisplay,
  ButtonGrid: CalculatorButtonGrid,
  Button: CalculatorButton,
  Sidebar: CalculatorSidebar,
  History: CalculatorHistory,
  Settings: CalculatorSettings
};

// Usage
<Calculator.Root mode="scientific">
  <Calculator.Display precision={10} />
  <Calculator.ButtonGrid layout="scientific">
    <Calculator.Button type="number" value="7" />
    <Calculator.Button type="operator" value="+" />
    <Calculator.Button type="function" value="sin" />
  </Calculator.ButtonGrid>
  <Calculator.Sidebar>
    <Calculator.History maxItems={100} />
    <Calculator.Settings />
  </Calculator.Sidebar>
</Calculator.Root>
```

#### 2. Render Props Pattern
```typescript
// Flexible button rendering
interface ButtonGridProps {
  children: (props: ButtonGridRenderProps) => React.ReactNode;
}

const ButtonGrid: React.FC<ButtonGridProps> = ({ children }) => {
  const { buttons, layout, onButtonPress } = useButtonGrid();
  
  return (
    <div className="button-grid">
      {children({ buttons, layout, onButtonPress })}
    </div>
  );
};

// Usage
<ButtonGrid>
  {({ buttons, onButtonPress }) => 
    buttons.map(button => (
      <CustomButton 
        key={button.id} 
        {...button} 
        onPress={onButtonPress} 
      />
    ))
  }
</ButtonGrid>
```

#### 3. Higher-Order Components
```typescript
// Performance monitoring HOC
const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const renderStart = performance.now();
    
    useEffect(() => {
      const renderEnd = performance.now();
      console.log(`${componentName} render time: ${renderEnd - renderStart}ms`);
    });
    
    return <Component {...props} />;
  });
};

// Usage
const TrackedCalculatorButton = withPerformanceTracking(
  CalculatorButton, 
  'CalculatorButton'
);
```

## State Management Architecture

### Store Design Patterns

#### 1. Modular Store Architecture
```typescript
// Store composition pattern
interface AppState {
  calculator: CalculatorState;
  history: HistoryState;
  memory: MemoryState;
  theme: ThemeState;
  settings: SettingsState;
  plugins: PluginState;
}

// Individual store slices
const useAppStore = create<AppState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          calculator: createCalculatorSlice(set, get),
          history: createHistorySlice(set, get),
          memory: createMemorySlice(set, get),
          theme: createThemeSlice(set, get),
          settings: createSettingsSlice(set, get),
          plugins: createPluginSlice(set, get)
        }))
      ),
      {
        name: 'calculator-app-state',
        partialize: (state) => ({
          theme: state.theme,
          settings: state.settings,
          memory: state.memory
        })
      }
    ),
    { name: 'calculator-store' }
  )
);
```

#### 2. Advanced State Patterns
```typescript
// Command pattern for undo/redo
interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
}

class CalculatorCommand implements Command {
  constructor(
    private action: () => void,
    private undoAction: () => void
  ) {}
  
  execute() {
    this.action();
  }
  
  undo() {
    this.undoAction();
  }
  
  redo() {
    this.execute();
  }
}

// State machine for calculator modes
type CalculatorModeState = 
  | { type: 'IDLE' }
  | { type: 'INPUT'; value: string }
  | { type: 'OPERATION'; operator: Operator; operand: number }
  | { type: 'RESULT'; value: number }
  | { type: 'ERROR'; message: string };

const calculatorMachine = createMachine<CalculatorModeState>({
  id: 'calculator',
  initial: 'IDLE',
  states: {
    IDLE: {
      on: {
        INPUT_DIGIT: 'INPUT',
        INPUT_FUNCTION: 'RESULT'
      }
    },
    INPUT: {
      on: {
        INPUT_DIGIT: 'INPUT',
        INPUT_OPERATOR: 'OPERATION',
        CALCULATE: 'RESULT',
        CLEAR: 'IDLE'
      }
    },
    OPERATION: {
      on: {
        INPUT_DIGIT: 'INPUT',
        CALCULATE: 'RESULT',
        CLEAR: 'IDLE'
      }
    },
    RESULT: {
      on: {
        INPUT_DIGIT: 'INPUT',
        INPUT_OPERATOR: 'OPERATION',
        CLEAR: 'IDLE'
      }
    },
    ERROR: {
      on: {
        CLEAR: 'IDLE'
      }
    }
  }
});
```

## Advanced Features

### 1. Mathematical Engine
```typescript
// High-precision arithmetic using decimal.js
import { Decimal } from 'decimal.js';

class MathEngine {
  private precision: number = 34;
  
  constructor(precision?: number) {
    if (precision) {
      this.precision = precision;
      Decimal.set({ precision });
    }
  }
  
  add(a: string | number, b: string | number): string {
    return new Decimal(a).plus(new Decimal(b)).toString();
  }
  
  subtract(a: string | number, b: string | number): string {
    return new Decimal(a).minus(new Decimal(b)).toString();
  }
  
  multiply(a: string | number, b: string | number): string {
    return new Decimal(a).times(new Decimal(b)).toString();
  }
  
  divide(a: string | number, b: string | number): string {
    const divisor = new Decimal(b);
    if (divisor.isZero()) {
      throw new Error('Division by zero');
    }
    return new Decimal(a).dividedBy(divisor).toString();
  }
  
  power(base: string | number, exponent: string | number): string {
    return new Decimal(base).pow(new Decimal(exponent)).toString();
  }
  
  sqrt(value: string | number): string {
    const decimal = new Decimal(value);
    if (decimal.isNegative()) {
      throw new Error('Square root of negative number');
    }
    return decimal.sqrt().toString();
  }
  
  // Trigonometric functions with angle unit conversion
  sin(value: string | number, angleUnit: 'degrees' | 'radians' = 'radians'): string {
    let decimal = new Decimal(value);
    if (angleUnit === 'degrees') {
      decimal = decimal.times(Decimal.acos(-1)).dividedBy(180);
    }
    return Decimal.sin(decimal).toString();
  }
  
  cos(value: string | number, angleUnit: 'degrees' | 'radians' = 'radians'): string {
    let decimal = new Decimal(value);
    if (angleUnit === 'degrees') {
      decimal = decimal.times(Decimal.acos(-1)).dividedBy(180);
    }
    return Decimal.cos(decimal).toString();
  }
  
  tan(value: string | number, angleUnit: 'degrees' | 'radians' = 'radians'): string {
    let decimal = new Decimal(value);
    if (angleUnit === 'degrees') {
      decimal = decimal.times(Decimal.acos(-1)).dividedBy(180);
    }
    return Decimal.tan(decimal).toString();
  }
}
```

### 2. Expression Parser
```typescript
// Advanced expression parser with support for functions and constants
class ExpressionParser {
  private tokens: Token[] = [];
  private position: number = 0;
  
  parse(expression: string): ParsedExpression {
    this.tokens = this.tokenize(expression);
    this.position = 0;
    return this.parseExpression();
  }
  
  private tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    const regex = /(\d+\.?\d*)|([+\-*/^()])|([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    
    while ((match = regex.exec(expression)) !== null) {
      const [, number, operator, identifier] = match;
      
      if (number) {
        tokens.push({ type: 'NUMBER', value: number });
      } else if (operator) {
        tokens.push({ type: 'OPERATOR', value: operator });
      } else if (identifier) {
        if (this.isFunction(identifier)) {
          tokens.push({ type: 'FUNCTION', value: identifier });
        } else if (this.isConstant(identifier)) {
          tokens.push({ type: 'CONSTANT', value: identifier });
        } else {
          throw new Error(`Unknown identifier: ${identifier}`);
        }
      }
    }
    
    return tokens;
  }
  
  private parseExpression(): ParsedExpression {
    let left = this.parseTerm();
    
    while (this.match('OPERATOR', ['+', '-'])) {
      const operator = this.previous().value;
      const right = this.parseTerm();
      left = {
        type: 'BINARY_OPERATION',
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  private parseTerm(): ParsedExpression {
    let left = this.parseFactor();
    
    while (this.match('OPERATOR', ['*', '/'])) {
      const operator = this.previous().value;
      const right = this.parseFactor();
      left = {
        type: 'BINARY_OPERATION',
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  private parseFactor(): ParsedExpression {
    if (this.match('NUMBER')) {
      return {
        type: 'NUMBER',
        value: this.previous().value
      };
    }
    
    if (this.match('CONSTANT')) {
      return {
        type: 'CONSTANT',
        name: this.previous().value
      };
    }
    
    if (this.match('FUNCTION')) {
      const functionName = this.previous().value;
      this.consume('OPERATOR', '(', 'Expected "(" after function name');
      
      const args: ParsedExpression[] = [];
      if (!this.check('OPERATOR', ')')) {
        do {
          args.push(this.parseExpression());
        } while (this.match('OPERATOR', ','));
      }
      
      this.consume('OPERATOR', ')', 'Expected ")" after function arguments');
      
      return {
        type: 'FUNCTION_CALL',
        name: functionName,
        arguments: args
      };
    }
    
    if (this.match('OPERATOR', '(')) {
      const expr = this.parseExpression();
      this.consume('OPERATOR', ')', 'Expected ")" after expression');
      return expr;
    }
    
    throw new Error('Unexpected token');
  }
}
```

### 3. Plugin System Implementation
```typescript
// Advanced plugin system with hot reloading
class AdvancedPluginManager {
  private plugins = new Map<string, LoadedPlugin>();
  private pluginDependencies = new Map<string, Set<string>>();
  private eventBus = new EventEmitter();
  
  async loadPlugin(pluginSource: string | PluginDefinition): Promise<void> {
    const plugin = typeof pluginSource === 'string' 
      ? await this.loadFromUrl(pluginSource)
      : pluginSource;
    
    // Validate plugin
    await this.validatePlugin(plugin);
    
    // Check dependencies
    await this.resolveDependencies(plugin);
    
    // Create sandbox
    const sandbox = await this.createSandbox(plugin);
    
    // Load plugin in sandbox
    const loadedPlugin = await sandbox.load(plugin);
    
    this.plugins.set(plugin.id, loadedPlugin);
    this.eventBus.emit('plugin:loaded', plugin);
  }
  
  async hotReload(pluginId: string): Promise<void> {
    const existingPlugin = this.plugins.get(pluginId);
    if (!existingPlugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    // Preserve state
    const state = await existingPlugin.getState();
    
    // Unload current version
    await this.unloadPlugin(pluginId);
    
    // Load new version
    await this.loadPlugin(existingPlugin.source);
    
    // Restore state
    const newPlugin = this.plugins.get(pluginId)!;
    await newPlugin.setState(state);
    
    this.eventBus.emit('plugin:hot-reloaded', pluginId);
  }
  
  private async createSandbox(plugin: PluginDefinition): Promise<PluginSandbox> {
    const worker = new Worker('/plugin-sandbox-worker.js');
    
    return new PluginSandbox(worker, {
      permissions: plugin.permissions,
      resourceLimits: {
        memory: 50 * 1024 * 1024, // 50MB
        cpu: 1000, // 1 second
        network: plugin.permissions.includes('network')
      }
    });
  }
}
```

## Accessibility Implementation

### 1. Comprehensive ARIA Support
```typescript
// Accessible calculator button component
const AccessibleCalculatorButton: React.FC<ButtonProps> = ({
  value,
  type,
  onPress,
  isPressed,
  isDisabled
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  
  const ariaLabel = useMemo(() => {
    switch (type) {
      case 'number':
        return `Number ${value}`;
      case 'operator':
        return getOperatorDescription(value);
      case 'function':
        return getFunctionDescription(value);
      case 'control':
        return getControlDescription(value);
      default:
        return value;
    }
  }, [type, value]);
  
  const handlePress = () => {
    onPress(value);
    
    // Announce action to screen readers
    const actionAnnouncement = `${ariaLabel} pressed`;
    setAnnouncement(actionAnnouncement);
    
    // Clear announcement after short delay
    setTimeout(() => setAnnouncement(''), 100);
  };
  
  return (
    <>
      <button
        ref={buttonRef}
        className={`calculator-button ${type} ${isPressed ? 'pressed' : ''}`}
        onClick={handlePress}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-pressed={isPressed}
        aria-describedby={`${value}-description`}
        role="button"
        tabIndex={0}
      >
        {value}
      </button>
      
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Button description for screen readers */}
      <div id={`${value}-description`} className="sr-only">
        {getDetailedDescription(type, value)}
      </div>
    </>
  );
};
```

### 2. Keyboard Navigation
```typescript
// Advanced keyboard navigation system
const useKeyboardNavigation = () => {
  const [focusedButton, setFocusedButton] = useState<string | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey } = event;
    
    // Handle arrow key navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      navigateButtons(key);
      return;
    }
    
    // Handle calculator input
    if (/[0-9]/.test(key)) {
      pressButton(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
      pressButton(key);
    } else if (key === 'Enter' || key === '=') {
      pressButton('=');
    } else if (key === 'Escape') {
      pressButton('clear');
    } else if (key === 'Backspace') {
      pressButton('backspace');
    }
    
    // Handle shortcuts
    if (ctrlKey) {
      switch (key) {
        case 'c':
          copyCurrentValue();
          break;
        case 'v':
          pasteValue();
          break;
        case 'z':
          if (shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
      }
    }
  }, []);
  
  const navigateButtons = (direction: string) => {
    const buttons = Array.from(buttonRefs.current.entries());
    const currentIndex = buttons.findIndex(([id]) => id === focusedButton);
    
    let nextIndex: number;
    switch (direction) {
      case 'ArrowUp':
        nextIndex = Math.max(0, currentIndex - 4); // Assuming 4 columns
        break;
      case 'ArrowDown':
        nextIndex = Math.min(buttons.length - 1, currentIndex + 4);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        nextIndex = Math.min(buttons.length - 1, currentIndex + 1);
        break;
      default:
        return;
    }
    
    const [nextButtonId, nextButtonElement] = buttons[nextIndex];
    setFocusedButton(nextButtonId);
    nextButtonElement.focus();
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return {
    focusedButton,
    setFocusedButton,
    registerButton: (id: string, element: HTMLButtonElement) => {
      buttonRefs.current.set(id, element);
    },
    unregisterButton: (id: string) => {
      buttonRefs.current.delete(id);
    }
  };
};
```

## Progressive Web App Features

### 1. Service Worker Implementation
```typescript
// Advanced service worker with background sync
const CACHE_NAME = 'calculator-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => 
        Promise.all(
          cacheNames
            .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map(name => caches.delete(name))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Handle API requests with network-first strategy
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
  );
});

// Background sync for calculation history
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    event.waitUntil(syncCalculations());
  }
});

async function syncCalculations() {
  const calculations = await getUnsyncedCalculations();
  
  for (const calculation of calculations) {
    try {
      await fetch('/api/calculations', {
        method: 'POST',
        body: JSON.stringify(calculation),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await markCalculationSynced(calculation.id);
    } catch (error) {
      console.error('Failed to sync calculation:', error);
    }
  }
}
```

### 2. Offline Functionality
```typescript
// Offline detection and handling
const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<Operation[]>([]);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingOperations();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const queueOperation = useCallback((operation: Operation) => {
    if (isOnline) {
      executeOperation(operation);
    } else {
      setPendingOperations(prev => [...prev, operation]);
      storeOperationLocally(operation);
    }
  }, [isOnline]);
  
  const syncPendingOperations = useCallback(async () => {
    for (const operation of pendingOperations) {
      try {
        await executeOperation(operation);
        removeLocalOperation(operation.id);
      } catch (error) {
        console.error('Failed to sync operation:', error);
      }
    }
    setPendingOperations([]);
  }, [pendingOperations]);
  
  return {
    isOnline,
    queueOperation,
    pendingOperations: pendingOperations.length
  };
};
```

This modern calculator architecture provides a comprehensive foundation for building a world-class calculator application that leverages the latest web technologies while maintaining exceptional performance, accessibility, and user experience.