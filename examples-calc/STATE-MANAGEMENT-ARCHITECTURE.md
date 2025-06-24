# 🏪 State Management Architecture - Modern Calculator Application

## 📋 Overview

This document outlines the comprehensive state management architecture for the modern calculator application using Zustand with TypeScript. The architecture emphasizes immutability, type safety, performance, and modularity through a slice-based approach.

## 🎯 State Management Principles

### Core Principles
- **Immutability**: All state updates create new state objects
- **Type Safety**: Full TypeScript support with strict typing
- **Modularity**: Slice-based architecture for separation of concerns
- **Performance**: Optimized selectors and minimal re-renders
- **Predictability**: Clear state update patterns and debugging support
- **Persistence**: Selective state persistence with hydration support

### Design Goals
- **Developer Experience**: Intuitive API with excellent TypeScript support
- **Performance**: Sub-millisecond state updates with efficient subscriptions
- **Scalability**: Architecture that grows with application complexity
- **Testability**: Easy to test state logic in isolation
- **Debugging**: Rich debugging tools and state inspection
- **Persistence**: Seamless state persistence and restoration

## 🏗️ State Architecture Overview

```typescript
interface ApplicationState {
  // Core calculator functionality
  calculator: CalculatorSlice;
  
  // Calculation history and memory
  history: HistorySlice;
  
  // User preferences and configuration
  settings: SettingsSlice;
  
  // Plugin management and state
  plugins: PluginSlice;
  
  // UI state and interactions
  ui: UISlice;
  
  // Accessibility preferences and state
  accessibility: AccessibilitySlice;
  
  // Theme and appearance
  theme: ThemeSlice;
  
  // Error handling and notifications
  errors: ErrorSlice;
  
  // Performance monitoring
  performance: PerformanceSlice;
}
```

## 🧮 Calculator Slice

### State Structure
```typescript
interface CalculatorSlice {
  // Current calculation state
  currentValue: string;
  previousValue: string;
  operation: Operation | null;
  expression: string;
  result: CalculationResult | null;
  
  // Calculator mode and configuration
  mode: CalculatorMode;
  precision: number;
  angleUnit: AngleUnit;
  numberFormat: NumberFormat;
  
  // Input state
  isNewCalculation: boolean;
  hasDecimalPoint: boolean;
  isWaitingForOperand: boolean;
  
  // Memory functions
  memory: MemoryState;
  
  // Actions
  actions: CalculatorActions;
}

interface CalculatorActions {
  // Number input
  inputDigit: (digit: string) => void;
  inputDecimal: () => void;
  inputNumber: (number: string) => void;
  
  // Operations
  performOperation: (operation: Operation) => void;
  calculate: () => void;
  clear: () => void;
  clearEntry: () => void;
  
  // Advanced functions
  performFunction: (func: MathFunction, ...args: number[]) => void;
  
  // Memory operations
  memoryStore: () => void;
  memoryRecall: () => void;
  memoryClear: () => void;
  memoryAdd: () => void;
  memorySubtract: () => void;
  
  // Mode switching
  setMode: (mode: CalculatorMode) => void;
  setPrecision: (precision: number) => void;
  setAngleUnit: (unit: AngleUnit) => void;
  setNumberFormat: (format: NumberFormat) => void;
}

interface MemoryState {
  value: number;
  hasValue: boolean;
  history: MemoryOperation[];
}

enum CalculatorMode {
  BASIC = 'basic',
  SCIENTIFIC = 'scientific',
  PROGRAMMER = 'programmer',
  STATISTICAL = 'statistical',
  FINANCIAL = 'financial',
  GRAPHING = 'graphing'
}

enum AngleUnit {
  DEGREES = 'degrees',
  RADIANS = 'radians',
  GRADIANS = 'gradians'
}

enum NumberFormat {
  DECIMAL = 'decimal',
  SCIENTIFIC = 'scientific',
  ENGINEERING = 'engineering',
  FIXED = 'fixed'
}
```

### Implementation
```typescript
const createCalculatorSlice: StateCreator<
  ApplicationState,
  [],
  [],
  CalculatorSlice
> = (set, get) => ({
  // Initial state
  currentValue: '0',
  previousValue: '',
  operation: null,
  expression: '',
  result: null,
  mode: CalculatorMode.BASIC,
  precision: 10,
  angleUnit: AngleUnit.DEGREES,
  numberFormat: NumberFormat.DECIMAL,
  isNewCalculation: true,
  hasDecimalPoint: false,
  isWaitingForOperand: false,
  memory: {
    value: 0,
    hasValue: false,
    history: []
  },
  
  actions: {
    inputDigit: (digit: string) => {
      set((state) => {
        const calculator = state.calculator;
        
        if (calculator.isWaitingForOperand) {
          return {
            ...state,
            calculator: {
              ...calculator,
              currentValue: digit,
              isWaitingForOperand: false,
              isNewCalculation: false,
              hasDecimalPoint: false
            }
          };
        }
        
        const newValue = calculator.isNewCalculation 
          ? digit 
          : calculator.currentValue === '0' 
            ? digit 
            : calculator.currentValue + digit;
            
        return {
          ...state,
          calculator: {
            ...calculator,
            currentValue: newValue,
            isNewCalculation: false
          }
        };
      });
    },
    
    inputDecimal: () => {
      set((state) => {
        const calculator = state.calculator;
        
        if (calculator.hasDecimalPoint) return state;
        
        if (calculator.isWaitingForOperand || calculator.isNewCalculation) {
          return {
            ...state,
            calculator: {
              ...calculator,
              currentValue: '0.',
              hasDecimalPoint: true,
              isWaitingForOperand: false,
              isNewCalculation: false
            }
          };
        }
        
        return {
          ...state,
          calculator: {
            ...calculator,
            currentValue: calculator.currentValue + '.',
            hasDecimalPoint: true
          }
        };
      });
    },
    
    performOperation: (operation: Operation) => {
      set((state) => {
        const calculator = state.calculator;
        const inputValue = parseFloat(calculator.currentValue);
        
        if (calculator.previousValue === '' || calculator.isWaitingForOperand) {
          return {
            ...state,
            calculator: {
              ...calculator,
              previousValue: calculator.currentValue,
              operation,
              isWaitingForOperand: true,
              expression: `${calculator.currentValue} ${operation.symbol}`
            }
          };
        }
        
        const prevValue = parseFloat(calculator.previousValue);
        const result = calculator.operation?.implementation(prevValue, inputValue) ?? inputValue;
        
        return {
          ...state,
          calculator: {
            ...calculator,
            currentValue: String(result),
            previousValue: String(result),
            operation,
            isWaitingForOperand: true,
            expression: `${result} ${operation.symbol}`,
            result: {
              value: result,
              expression: `${calculator.previousValue} ${calculator.operation?.symbol} ${calculator.currentValue}`,
              timestamp: new Date()
            }
          },
          history: {
            ...state.history,
            calculations: [
              ...state.history.calculations,
              {
                expression: `${calculator.previousValue} ${calculator.operation?.symbol} ${calculator.currentValue}`,
                result: result,
                timestamp: new Date(),
                mode: calculator.mode
              }
            ]
          }
        };
      });
    },
    
    calculate: () => {
      set((state) => {
        const calculator = state.calculator;
        
        if (!calculator.operation || calculator.isWaitingForOperand) {
          return state;
        }
        
        const prevValue = parseFloat(calculator.previousValue);
        const currentValue = parseFloat(calculator.currentValue);
        const result = calculator.operation.implementation(prevValue, currentValue);
        
        const calculation: HistoryEntry = {
          expression: `${calculator.previousValue} ${calculator.operation.symbol} ${calculator.currentValue}`,
          result,
          timestamp: new Date(),
          mode: calculator.mode
        };
        
        return {
          ...state,
          calculator: {
            ...calculator,
            currentValue: String(result),
            previousValue: '',
            operation: null,
            expression: '',
            isNewCalculation: true,
            isWaitingForOperand: false,
            hasDecimalPoint: false,
            result: {
              value: result,
              expression: calculation.expression,
              timestamp: new Date()
            }
          },
          history: {
            ...state.history,
            calculations: [...state.history.calculations, calculation],
            lastCalculation: calculation
          }
        };
      });
    },
    
    clear: () => {
      set((state) => ({
        ...state,
        calculator: {
          ...state.calculator,
          currentValue: '0',
          previousValue: '',
          operation: null,
          expression: '',
          result: null,
          isNewCalculation: true,
          isWaitingForOperand: false,
          hasDecimalPoint: false
        }
      }));
    },
    
    // Additional actions...
  }
});
```

## 📚 History Slice

### State Structure
```typescript
interface HistorySlice {
  calculations: HistoryEntry[];
  lastCalculation: HistoryEntry | null;
  favorites: HistoryEntry[];
  maxEntries: number;
  isEnabled: boolean;
  
  actions: HistoryActions;
}

interface HistoryActions {
  addCalculation: (entry: HistoryEntry) => void;
  removeCalculation: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (id: string) => void;
  replayCalculation: (id: string) => void;
  exportHistory: () => string;
  importHistory: (data: string) => void;
  setMaxEntries: (max: number) => void;
  toggleHistory: (enabled: boolean) => void;
}

interface HistoryEntry {
  id: string;
  expression: string;
  result: number;
  timestamp: Date;
  mode: CalculatorMode;
  isFavorite?: boolean;
  metadata?: CalculationMetadata;
}
```

## ⚙️ Settings Slice

### State Structure
```typescript
interface SettingsSlice {
  // Display preferences
  display: DisplaySettings;
  
  // Input preferences
  input: InputSettings;
  
  // Calculation preferences
  calculation: CalculationSettings;
  
  // Accessibility preferences
  accessibility: AccessibilitySettings;
  
  // Performance preferences
  performance: PerformanceSettings;
  
  // Privacy preferences
  privacy: PrivacySettings;
  
  actions: SettingsActions;
}

interface DisplaySettings {
  theme: string;
  fontSize: FontSize;
  highContrast: boolean;
  animations: boolean;
  compactMode: boolean;
  showTooltips: boolean;
}

interface InputSettings {
  keyboardShortcuts: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  gestureSupport: boolean;
  autoCalculate: boolean;
}

interface CalculationSettings {
  precision: number;
  angleUnit: AngleUnit;
  numberFormat: NumberFormat;
  scientificNotation: boolean;
  thousandsSeparator: boolean;
  decimalSeparator: string;
}
```

## 🔌 Plugin Slice

### State Structure
```typescript
interface PluginSlice {
  // Plugin registry and management
  installed: InstalledPlugin[];
  available: AvailablePlugin[];
  enabled: string[];
  
  // Plugin state
  pluginStates: Record<string, PluginState>;
  
  // Plugin configuration
  configurations: Record<string, PluginConfiguration>;
  
  // Plugin permissions
  permissions: Record<string, PluginPermission[]>;
  
  actions: PluginActions;
}

interface PluginActions {
  installPlugin: (plugin: PluginPackage) => Promise<void>;
  uninstallPlugin: (pluginId: string) => Promise<void>;
  enablePlugin: (pluginId: string) => void;
  disablePlugin: (pluginId: string) => void;
  configurePlugin: (pluginId: string, config: PluginConfiguration) => void;
  updatePlugin: (pluginId: string) => Promise<void>;
  getPluginState: (pluginId: string) => PluginState;
  setPluginState: (pluginId: string, state: PluginState) => void;
}
```

## 🎨 UI Slice

### State Structure
```typescript
interface UISlice {
  // Layout state
  layout: LayoutState;
  
  // Modal and dialog state
  modals: ModalState;
  
  // Navigation state
  navigation: NavigationState;
  
  // Loading and progress state
  loading: LoadingState;
  
  // Notification state
  notifications: NotificationState;
  
  actions: UIActions;
}

interface LayoutState {
  sidebarOpen: boolean;
  panelSizes: Record<string, number>;
  activePanel: string;
  fullscreen: boolean;
  orientation: 'portrait' | 'landscape';
}

interface ModalState {
  activeModal: string | null;
  modalData: Record<string, any>;
  modalHistory: string[];
}
```

## 🔄 State Persistence

### Persistence Configuration
```typescript
interface PersistenceConfig {
  // Which slices to persist
  persistedSlices: (keyof ApplicationState)[];
  
  // Storage adapter
  storage: StorageAdapter;
  
  // Serialization options
  serialization: SerializationOptions;
  
  // Migration support
  migrations: StateMigration[];
  
  // Hydration options
  hydration: HydrationOptions;
}

interface StateMigration {
  version: number;
  migrate: (state: any) => any;
}

interface HydrationOptions {
  timeout: number;
  fallback: Partial<ApplicationState>;
  validation: (state: any) => boolean;
}
```

### Implementation
```typescript
const persistenceMiddleware = <T>(
  config: PersistenceConfig
): StateCreator<T, [], [], T> => (set, get, api) => {
  // Hydrate state on initialization
  const hydrateState = async () => {
    try {
      const persistedState = await config.storage.get('calculator-state');
      if (persistedState && config.hydration.validation(persistedState)) {
        set(persistedState);
      }
    } catch (error) {
      console.warn('Failed to hydrate state:', error);
      set(config.hydration.fallback as T);
    }
  };
  
  // Persist state on changes
  const persistState = debounce(async (state: T) => {
    try {
      const stateToPersist = pick(state, config.persistedSlices);
      await config.storage.set('calculator-state', stateToPersist);
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }, 1000);
  
  // Subscribe to state changes
  api.subscribe((state) => {
    persistState(state);
  });
  
  // Initialize hydration
  hydrateState();
  
  return set;
};
```

## 🧪 State Testing

### Testing Utilities
```typescript
interface StateTestUtils {
  createTestStore: () => StoreApi<ApplicationState>;
  mockSlice: <T>(slice: T) => T;
  assertStateChange: (
    action: () => void,
    assertion: (state: ApplicationState) => boolean
  ) => void;
  snapshotState: () => ApplicationState;
  restoreState: (snapshot: ApplicationState) => void;
}

// Example test
describe('Calculator State', () => {
  let store: StoreApi<ApplicationState>;
  
  beforeEach(() => {
    store = createTestStore();
  });
  
  it('should handle digit input correctly', () => {
    const { calculator } = store.getState();
    
    calculator.actions.inputDigit('5');
    
    expect(store.getState().calculator.currentValue).toBe('5');
    expect(store.getState().calculator.isNewCalculation).toBe(false);
  });
  
  it('should perform calculations correctly', () => {
    const { calculator } = store.getState();
    
    calculator.actions.inputDigit('5');
    calculator.actions.performOperation(Operations.ADD);
    calculator.actions.inputDigit('3');
    calculator.actions.calculate();
    
    expect(store.getState().calculator.currentValue).toBe('8');
    expect(store.getState().history.calculations).toHaveLength(1);
  });
});
```

## 📊 Performance Optimization

### Selector Optimization
```typescript
// Memoized selectors for performance
const useCalculatorDisplay = () => {
  return useStore(
    useCallback(
      (state: ApplicationState) => ({
        currentValue: state.calculator.currentValue,
        expression: state.calculator.expression,
        result: state.calculator.result,
        mode: state.calculator.mode
      }),
      []
    )
  );
};

const useHistoryEntries = () => {
  return useStore(
    useCallback(
      (state: ApplicationState) => state.history.calculations,
      []
    )
  );
};

// Shallow comparison for object selectors
const useCalculatorState = () => {
  return useStore(
    (state: ApplicationState) => state.calculator,
    shallow
  );
};
```

### State Update Optimization
```typescript
// Batch state updates for performance
const batchedUpdate = (updates: Array<() => void>) => {
  unstable_batchedUpdates(() => {
    updates.forEach(update => update());
  });
};

// Debounced state updates for expensive operations
const debouncedCalculate = debounce((expression: string) => {
  // Perform expensive calculation
}, 300);
```

## 🔍 Debugging and DevTools

### Development Tools
```typescript
interface StateDevTools {
  timeTravel: TimeTravelDebugger;
  stateInspector: StateInspector;
  actionLogger: ActionLogger;
  performanceProfiler: PerformanceProfiler;
}

// Redux DevTools integration
const store = create<ApplicationState>()(
  devtools(
    (...args) => ({
      ...createCalculatorSlice(...args),
      ...createHistorySlice(...args),
      ...createSettingsSlice(...args),
      // ... other slices
    }),
    {
      name: 'calculator-store',
      trace: true,
      traceLimit: 25
    }
  )
);
```

## 📝 Best Practices

### State Management Guidelines
1. **Immutability**: Always create new state objects, never mutate existing state
2. **Type Safety**: Use strict TypeScript types for all state and actions
3. **Modularity**: Keep slices focused on single responsibilities
4. **Performance**: Use selectors and memoization to prevent unnecessary re-renders
5. **Testing**: Write comprehensive tests for all state logic
6. **Documentation**: Document complex state interactions and business logic

### Common Patterns
```typescript
// Pattern: Conditional state updates
const conditionalUpdate = (condition: boolean, update: StateUpdate) => {
  set((state) => condition ? { ...state, ...update } : state);
};

// Pattern: Async action handling
const asyncAction = async (params: ActionParams) => {
  set((state) => ({ ...state, loading: true }));
  
  try {
    const result = await performAsyncOperation(params);
    set((state) => ({ 
      ...state, 
      data: result, 
      loading: false 
    }));
  } catch (error) {
    set((state) => ({ 
      ...state, 
      error: error.message, 
      loading: false 
    }));
  }
};

// Pattern: Optimistic updates
const optimisticUpdate = (optimisticData: Data, operation: () => Promise<Data>) => {
  set((state) => ({ ...state, data: optimisticData }));
  
  operation()
    .then((actualData) => {
      set((state) => ({ ...state, data: actualData }));
    })
    .catch((error) => {
      // Revert optimistic update
      set((state) => ({ ...state, data: state.previousData, error }));
    });
};
```

## 🎯 Conclusion

This state management architecture provides a robust, scalable, and maintainable foundation for the modern calculator application. The slice-based approach with Zustand offers excellent performance, type safety, and developer experience while maintaining the flexibility to grow with the application's needs.

The architecture supports complex calculator functionality, plugin systems, and rich user interactions while maintaining clean separation of concerns and predictable state updates. The comprehensive testing and debugging support ensures reliability and maintainability throughout the application's lifecycle.