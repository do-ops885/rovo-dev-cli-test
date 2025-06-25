# State Management Architecture

## Overview
This document outlines the state management strategy for the modular calculator application using Zustand as the primary state management solution, with additional patterns for local component state and derived state.

## State Management Philosophy

### 1. Principles
- **Single Source of Truth**: Global state centralized in Zustand stores
- **Predictable Updates**: Immutable state updates with clear action patterns
- **Minimal State**: Store only essential state, derive everything else
- **Performance**: Optimized subscriptions and selective updates
- **Developer Experience**: Type-safe state with excellent debugging tools

### 2. State Categories
- **Global State**: Application-wide state (calculator mode, theme, settings)
- **Feature State**: Feature-specific state (calculation state, history, memory)
- **Local State**: Component-specific state (UI interactions, form inputs)
- **Derived State**: Computed values from existing state
- **Persistent State**: State that survives page refreshes

## Store Architecture

### 1. Main Calculator Store
**Purpose**: Core calculator functionality and state.

```typescript
interface CalculatorState {
  // Current calculation state
  currentValue: string;
  previousValue: string;
  operator: Operator | null;
  expression: string;
  isResult: boolean;
  isError: boolean;
  errorMessage: string;
  
  // Calculator mode and settings
  mode: CalculatorMode;
  precision: number;
  angleUnit: 'degrees' | 'radians';
  scientificNotation: boolean;
  
  // Input state
  waitingForOperand: boolean;
  lastOperation: Operation | null;
  
  // Actions
  inputDigit: (digit: string) => void;
  inputOperator: (operator: Operator) => void;
  inputFunction: (func: MathFunction) => void;
  calculate: () => void;
  clear: () => void;
  clearEntry: () => void;
  backspace: () => void;
  toggleSign: () => void;
  inputDecimal: () => void;
  
  // Mode and settings actions
  setMode: (mode: CalculatorMode) => void;
  setPrecision: (precision: number) => void;
  setAngleUnit: (unit: 'degrees' | 'radians') => void;
  setScientificNotation: (enabled: boolean) => void;
}
```

### 2. History Store
**Purpose**: Manages calculation history and related operations.

```typescript
interface HistoryState {
  // History data
  calculations: CalculationHistory[];
  maxHistorySize: number;
  
  // Search and filtering
  searchQuery: string;
  filteredCalculations: CalculationHistory[];
  
  // UI state
  isHistoryVisible: boolean;
  selectedCalculation: CalculationHistory | null;
  
  // Actions
  addCalculation: (calculation: CalculationHistory) => void;
  removeCalculation: (id: string) => void;
  clearHistory: () => void;
  searchHistory: (query: string) => void;
  selectCalculation: (calculation: CalculationHistory) => void;
  toggleHistoryVisibility: () => void;
  
  // Bulk operations
  exportHistory: () => string;
  importHistory: (data: string) => void;
  favoriteCalculation: (id: string) => void;
}

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
  mode: CalculatorMode;
  isFavorite: boolean;
  tags: string[];
}
```

### 3. Memory Store
**Purpose**: Handles memory operations and storage.

```typescript
interface MemoryState {
  // Memory slots
  memoryValue: number | null;
  memorySlots: MemorySlot[];
  activeSlot: number;
  
  // Actions
  memoryStore: (value: number, slot?: number) => void;
  memoryRecall: (slot?: number) => number | null;
  memoryClear: (slot?: number) => void;
  memoryAdd: (value: number, slot?: number) => void;
  memorySubtract: (value: number, slot?: number) => void;
  
  // Slot management
  createSlot: (name: string) => void;
  deleteSlot: (slot: number) => void;
  renameSlot: (slot: number, name: string) => void;
  setActiveSlot: (slot: number) => void;
}

interface MemorySlot {
  id: number;
  name: string;
  value: number | null;
  timestamp: Date;
}
```

### 4. Theme Store
**Purpose**: Manages application theming and appearance.

```typescript
interface ThemeState {
  // Current theme
  currentTheme: Theme;
  availableThemes: Theme[];
  
  // Theme settings
  autoTheme: boolean;
  systemTheme: 'light' | 'dark';
  customThemes: CustomTheme[];
  
  // Accessibility
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleAutoTheme: () => void;
  createCustomTheme: (theme: CustomTheme) => void;
  deleteCustomTheme: (id: string) => void;
  setAccessibilityOption: (option: AccessibilityOption, value: any) => void;
}

interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'auto';
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
}
```

### 5. Settings Store
**Purpose**: Application settings and user preferences.

```typescript
interface SettingsState {
  // General settings
  language: string;
  region: string;
  currency: string;
  
  // Calculator settings
  defaultMode: CalculatorMode;
  soundEnabled: boolean;
  hapticFeedback: boolean;
  keyboardShortcuts: boolean;
  
  // Display settings
  thousandsSeparator: string;
  decimalSeparator: string;
  numberFormat: 'standard' | 'scientific' | 'engineering';
  
  // Privacy settings
  saveHistory: boolean;
  analyticsEnabled: boolean;
  
  // Actions
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (data: string) => void;
}
```

## Store Implementation Patterns

### 1. Zustand Store Creation
```typescript
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useCalculatorStore = create<CalculatorState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          currentValue: '0',
          previousValue: '',
          operator: null,
          expression: '',
          isResult: false,
          isError: false,
          errorMessage: '',
          mode: 'basic',
          precision: 10,
          angleUnit: 'degrees',
          scientificNotation: false,
          waitingForOperand: false,
          lastOperation: null,
          
          // Actions implementation
          inputDigit: (digit: string) => set((state) => {
            if (state.isError) {
              state.currentValue = digit;
              state.isError = false;
              state.errorMessage = '';
            } else if (state.waitingForOperand) {
              state.currentValue = digit;
              state.waitingForOperand = false;
            } else {
              state.currentValue = state.currentValue === '0' ? digit : state.currentValue + digit;
            }
            state.isResult = false;
          }),
          
          inputOperator: (operator: Operator) => set((state) => {
            const inputValue = parseFloat(state.currentValue);
            
            if (state.previousValue === '') {
              state.previousValue = state.currentValue;
            } else if (state.operator && !state.waitingForOperand) {
              const prevValue = parseFloat(state.previousValue);
              const result = calculate(prevValue, inputValue, state.operator);
              
              state.currentValue = String(result);
              state.previousValue = String(result);
            }
            
            state.waitingForOperand = true;
            state.operator = operator;
            state.expression = `${state.previousValue} ${operator}`;
          }),
          
          calculate: () => set((state) => {
            const prev = parseFloat(state.previousValue);
            const current = parseFloat(state.currentValue);
            
            if (state.operator && !isNaN(prev) && !isNaN(current)) {
              try {
                const result = calculate(prev, current, state.operator);
                const calculation: CalculationHistory = {
                  id: generateId(),
                  expression: `${state.previousValue} ${state.operator} ${state.currentValue}`,
                  result: String(result),
                  timestamp: new Date(),
                  mode: state.mode,
                  isFavorite: false,
                  tags: []
                };
                
                // Add to history
                useHistoryStore.getState().addCalculation(calculation);
                
                state.currentValue = String(result);
                state.previousValue = '';
                state.operator = null;
                state.expression = '';
                state.isResult = true;
                state.waitingForOperand = true;
              } catch (error) {
                state.isError = true;
                state.errorMessage = error.message;
              }
            }
          }),
          
          clear: () => set((state) => {
            state.currentValue = '0';
            state.previousValue = '';
            state.operator = null;
            state.expression = '';
            state.isResult = false;
            state.isError = false;
            state.errorMessage = '';
            state.waitingForOperand = false;
          }),
          
          // ... other actions
        }))
      ),
      {
        name: 'calculator-state',
        partialize: (state) => ({
          mode: state.mode,
          precision: state.precision,
          angleUnit: state.angleUnit,
          scientificNotation: state.scientificNotation,
        }),
      }
    ),
    { name: 'calculator-store' }
  )
);
```

### 2. Derived State with Selectors
```typescript
// Computed selectors for derived state
export const useCalculatorSelectors = {
  // Display value with formatting
  displayValue: () => useCalculatorStore((state) => {
    if (state.isError) return 'Error';
    if (state.currentValue === '') return '0';
    
    const value = parseFloat(state.currentValue);
    if (state.scientificNotation && Math.abs(value) >= 1e10) {
      return value.toExponential(state.precision);
    }
    
    return formatNumber(value, state.precision);
  }),
  
  // Current expression for display
  currentExpression: () => useCalculatorStore((state) => {
    if (state.expression) {
      return state.waitingForOperand 
        ? state.expression 
        : `${state.expression} ${state.currentValue}`;
    }
    return state.currentValue;
  }),
  
  // Available functions based on mode
  availableFunctions: () => useCalculatorStore((state) => {
    switch (state.mode) {
      case 'basic':
        return BASIC_FUNCTIONS;
      case 'scientific':
        return [...BASIC_FUNCTIONS, ...SCIENTIFIC_FUNCTIONS];
      case 'programmer':
        return [...BASIC_FUNCTIONS, ...PROGRAMMER_FUNCTIONS];
      default:
        return BASIC_FUNCTIONS;
    }
  }),
};
```

### 3. Store Composition and Communication
```typescript
// Cross-store communication using subscriptions
export const setupStoreSubscriptions = () => {
  // Subscribe to calculator state changes to update history
  useCalculatorStore.subscribe(
    (state) => state.isResult,
    (isResult, prevIsResult) => {
      if (isResult && !prevIsResult) {
        // Result was just calculated, history was already added in calculate action
        console.log('Calculation completed');
      }
    }
  );
  
  // Subscribe to theme changes to update CSS variables
  useThemeStore.subscribe(
    (state) => state.currentTheme,
    (theme) => {
      updateCSSVariables(theme);
    }
  );
  
  // Subscribe to settings changes to update calculator behavior
  useSettingsStore.subscribe(
    (state) => ({
      thousandsSeparator: state.thousandsSeparator,
      decimalSeparator: state.decimalSeparator,
    }),
    (formatSettings) => {
      updateNumberFormatting(formatSettings);
    }
  );
};
```

## Local State Management

### 1. Component State with useState
```typescript
// For simple, local UI state
const ButtonComponent: React.FC<ButtonProps> = ({ onPress, value }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  
  const handleMouseDown = () => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      onLongPress?.(value);
    }, 500);
    setLongPressTimer(timer);
  };
  
  const handleMouseUp = () => {
    setIsPressed(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      onPress(value);
    }
  };
  
  return (
    <button
      className={`calculator-button ${isPressed ? 'pressed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {value}
    </button>
  );
};
```

### 2. Custom Hooks for Stateful Logic
```typescript
// Custom hook for keyboard handling
export const useKeyboardInput = () => {
  const inputDigit = useCalculatorStore((state) => state.inputDigit);
  const inputOperator = useCalculatorStore((state) => state.inputOperator);
  const calculate = useCalculatorStore((state) => state.calculate);
  const clear = useCalculatorStore((state) => state.clear);
  const backspace = useCalculatorStore((state) => state.backspace);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey } = event;
      
      // Prevent default for calculator keys
      if (/[0-9+\-*/=.]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
      }
      
      // Handle numeric input
      if (/[0-9]/.test(key)) {
        inputDigit(key);
      }
      
      // Handle operators
      switch (key) {
        case '+':
          inputOperator('+');
          break;
        case '-':
          inputOperator('-');
          break;
        case '*':
          inputOperator('×');
          break;
        case '/':
          inputOperator('÷');
          break;
        case '=':
        case 'Enter':
          calculate();
          break;
        case 'Escape':
          clear();
          break;
        case 'Backspace':
          backspace();
          break;
        case '.':
          inputDecimal();
          break;
      }
      
      // Handle shortcuts with modifiers
      if (ctrlKey || metaKey) {
        switch (key) {
          case 'c':
            // Copy current value
            navigator.clipboard.writeText(useCalculatorStore.getState().currentValue);
            break;
          case 'v':
            // Paste value
            navigator.clipboard.readText().then((text) => {
              const number = parseFloat(text);
              if (!isNaN(number)) {
                inputDigit(text);
              }
            });
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputOperator, calculate, clear, backspace]);
};
```

## State Persistence

### 1. Local Storage Persistence
```typescript
// Persist specific store slices
const persistConfig = {
  name: 'calculator-storage',
  version: 1,
  partialize: (state: CalculatorState) => ({
    mode: state.mode,
    precision: state.precision,
    angleUnit: state.angleUnit,
    scientificNotation: state.scientificNotation,
  }),
  migrate: (persistedState: any, version: number) => {
    // Handle state migrations between versions
    if (version === 0) {
      // Migrate from version 0 to 1
      return {
        ...persistedState,
        scientificNotation: false, // New field with default
      };
    }
    return persistedState;
  },
};
```

### 2. History Persistence
```typescript
// Separate persistence for history with size limits
const historyPersistConfig = {
  name: 'calculator-history',
  partialize: (state: HistoryState) => ({
    calculations: state.calculations.slice(-100), // Keep last 100 calculations
    maxHistorySize: state.maxHistorySize,
  }),
};
```

## Performance Optimizations

### 1. Selective Subscriptions
```typescript
// Subscribe only to specific state slices
const DisplayComponent: React.FC = () => {
  // Only re-render when display-related state changes
  const { currentValue, isError, errorMessage } = useCalculatorStore(
    (state) => ({
      currentValue: state.currentValue,
      isError: state.isError,
      errorMessage: state.errorMessage,
    }),
    shallow // Use shallow comparison for object
  );
  
  return (
    <div className="calculator-display">
      {isError ? errorMessage : currentValue}
    </div>
  );
};
```

### 2. Memoized Selectors
```typescript
// Memoize expensive computations
const useFormattedHistory = () => {
  return useHistoryStore(
    (state) => state.filteredCalculations.map(calc => ({
      ...calc,
      formattedResult: formatNumber(parseFloat(calc.result)),
      relativeTime: formatRelativeTime(calc.timestamp),
    })),
    (a, b) => a.length === b.length && a.every((item, i) => item.id === b[i].id)
  );
};
```

### 3. Debounced Updates
```typescript
// Debounce frequent state updates
const useDebouncedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchHistory = useHistoryStore((state) => state.searchHistory);
  
  const debouncedSearch = useMemo(
    () => debounce((query: string) => searchHistory(query), 300),
    [searchHistory]
  );
  
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);
  
  return [searchQuery, setSearchQuery] as const;
};
```

## Testing State Management

### 1. Store Testing
```typescript
// Test store actions and state changes
describe('Calculator Store', () => {
  beforeEach(() => {
    useCalculatorStore.setState({
      currentValue: '0',
      previousValue: '',
      operator: null,
      isResult: false,
    });
  });
  
  it('should input digits correctly', () => {
    const { inputDigit } = useCalculatorStore.getState();
    
    inputDigit('5');
    expect(useCalculatorStore.getState().currentValue).toBe('5');
    
    inputDigit('3');
    expect(useCalculatorStore.getState().currentValue).toBe('53');
  });
  
  it('should perform calculations correctly', () => {
    const { inputDigit, inputOperator, calculate } = useCalculatorStore.getState();
    
    inputDigit('5');
    inputOperator('+');
    inputDigit('3');
    calculate();
    
    expect(useCalculatorStore.getState().currentValue).toBe('8');
    expect(useCalculatorStore.getState().isResult).toBe(true);
  });
});
```

### 2. Hook Testing
```typescript
// Test custom hooks with state
import { renderHook, act } from '@testing-library/react';

describe('useKeyboardInput', () => {
  it('should handle numeric key presses', () => {
    const { result } = renderHook(() => useKeyboardInput());
    
    act(() => {
      const event = new KeyboardEvent('keydown', { key: '5' });
      window.dispatchEvent(event);
    });
    
    expect(useCalculatorStore.getState().currentValue).toBe('5');
  });
});
```

This state management architecture provides a robust, scalable, and performant foundation for the calculator application, with clear separation of concerns and excellent developer experience.