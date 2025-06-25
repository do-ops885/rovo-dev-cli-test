# Component Architecture

## Overview
This document outlines the React component architecture for the modular calculator application, defining the component hierarchy, interfaces, and relationships.

## Component Hierarchy

```
App
├── ThemeProvider
├── ErrorBoundary
└── CalculatorLayout
    ├── Header
    │   ├── Logo
    │   ├── ThemeToggle
    │   └── SettingsButton
    ├── Display
    │   ├── MainDisplay
    │   ├── ExpressionDisplay
    │   └── HistoryIndicator
    ├── ButtonGrid
    │   ├── NumberButtons
    │   ├── OperatorButtons
    │   ├── FunctionButtons
    │   └── ControlButtons
    ├── Sidebar (optional)
    │   ├── History
    │   ├── Memory
    │   └── Constants
    └── Footer
        ├── ModeSelector
        └── StatusBar
```

## Core Components

### 1. App Component
**Purpose**: Root application component that provides global context and routing.

```typescript
interface AppProps {
  children?: React.ReactNode;
}

interface AppState {
  theme: Theme;
  settings: AppSettings;
  error: Error | null;
}
```

**Responsibilities**:
- Initialize application state
- Provide global error boundary
- Manage theme context
- Handle application-level settings

### 2. CalculatorLayout Component
**Purpose**: Main layout container that orchestrates calculator components.

```typescript
interface CalculatorLayoutProps {
  mode: CalculatorMode;
  orientation: 'portrait' | 'landscape';
  showSidebar: boolean;
}

interface CalculatorLayoutState {
  isLoading: boolean;
  activePanel: 'calculator' | 'history' | 'settings';
}
```

**Responsibilities**:
- Manage layout responsiveness
- Handle mode switching
- Coordinate component communication
- Manage keyboard event delegation

### 3. Display Component
**Purpose**: Shows current calculation state and results.

```typescript
interface DisplayProps {
  value: string;
  expression: string;
  isError: boolean;
  fontSize: 'small' | 'medium' | 'large';
  precision: number;
}

interface DisplayState {
  animationState: 'idle' | 'calculating' | 'result';
  scrollPosition: number;
}
```

**Responsibilities**:
- Render current value and expression
- Handle text overflow and scrolling
- Animate value changes
- Support accessibility features

### 4. ButtonGrid Component
**Purpose**: Container for calculator buttons with dynamic layout.

```typescript
interface ButtonGridProps {
  mode: CalculatorMode;
  layout: ButtonLayout;
  onButtonPress: (button: ButtonType) => void;
  disabledButtons: string[];
}

interface ButtonGridState {
  pressedButton: string | null;
  longPressTimer: number | null;
}
```

**Responsibilities**:
- Render button layout based on mode
- Handle button interactions
- Manage button states (pressed, disabled)
- Support touch and keyboard input

## Button Components

### 1. BaseButton Component
**Purpose**: Base button component with common functionality.

```typescript
interface BaseButtonProps {
  value: string;
  label: string;
  type: ButtonType;
  variant: 'primary' | 'secondary' | 'operator' | 'function';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  ariaLabel?: string;
  onPress: (value: string) => void;
  onLongPress?: (value: string) => void;
}
```

**Variants**:
- **NumberButton**: Numeric input (0-9, decimal point)
- **OperatorButton**: Mathematical operators (+, -, ×, ÷, =)
- **FunctionButton**: Scientific functions (sin, cos, log, etc.)
- **ControlButton**: Control actions (clear, backspace, memory)

### 2. NumberButton Component
```typescript
interface NumberButtonProps extends BaseButtonProps {
  digit: number | 'decimal';
  isDecimalDisabled?: boolean;
}
```

### 3. OperatorButton Component
```typescript
interface OperatorButtonProps extends BaseButtonProps {
  operator: Operator;
  isActive?: boolean;
  precedence: number;
}
```

### 4. FunctionButton Component
```typescript
interface FunctionButtonProps extends BaseButtonProps {
  functionType: FunctionType;
  requiresInput?: boolean;
  category: 'trigonometric' | 'logarithmic' | 'exponential' | 'statistical';
}
```

## Display Components

### 1. MainDisplay Component
**Purpose**: Primary display for current value and results.

```typescript
interface MainDisplayProps {
  value: string;
  isError: boolean;
  isResult: boolean;
  maxDigits: number;
  scientificNotation: boolean;
}
```

### 2. ExpressionDisplay Component
**Purpose**: Shows the current mathematical expression being built.

```typescript
interface ExpressionDisplayProps {
  expression: string;
  cursor: number;
  showCursor: boolean;
  highlightErrors: boolean;
}
```

### 3. HistoryIndicator Component
**Purpose**: Shows calculation history status and quick access.

```typescript
interface HistoryIndicatorProps {
  hasHistory: boolean;
  historyCount: number;
  onToggleHistory: () => void;
}
```

## Sidebar Components

### 1. History Component
**Purpose**: Displays calculation history with search and management.

```typescript
interface HistoryProps {
  history: CalculationHistory[];
  onSelectHistory: (calculation: CalculationHistory) => void;
  onClearHistory: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

### 2. Memory Component
**Purpose**: Memory storage and recall functionality.

```typescript
interface MemoryProps {
  memoryValue: number | null;
  onMemoryStore: (value: number) => void;
  onMemoryRecall: () => void;
  onMemoryClear: () => void;
  onMemoryAdd: (value: number) => void;
  onMemorySubtract: (value: number) => void;
}
```

### 3. Constants Component
**Purpose**: Mathematical and physical constants.

```typescript
interface ConstantsProps {
  constants: Constant[];
  onSelectConstant: (constant: Constant) => void;
  favoriteConstants: string[];
  onToggleFavorite: (constantId: string) => void;
}
```

## Utility Components

### 1. ThemeProvider Component
**Purpose**: Provides theme context throughout the application.

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: Theme[];
}
```

### 2. ErrorBoundary Component
**Purpose**: Catches and handles React component errors gracefully.

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
```

### 3. KeyboardHandler Component
**Purpose**: Manages keyboard input and shortcuts.

```typescript
interface KeyboardHandlerProps {
  onKeyPress: (key: string, modifiers: KeyModifiers) => void;
  shortcuts: KeyboardShortcut[];
  disabled?: boolean;
}
```

## Component Communication Patterns

### 1. Props Down, Events Up
- Parent components pass data down via props
- Child components communicate up via callback functions
- State management centralized in appropriate parent components

### 2. Context for Global State
- Theme context for application-wide theming
- Settings context for user preferences
- Error context for global error handling

### 3. Custom Hooks for Logic
- `useCalculator`: Main calculator logic and state
- `useHistory`: History management
- `useKeyboard`: Keyboard event handling
- `useTheme`: Theme management
- `useSettings`: Settings persistence

## Component Styling Strategy

### 1. Tailwind CSS Classes
- Utility-first approach for rapid development
- Responsive design with mobile-first approach
- Dark mode support with class-based switching

### 2. CSS Modules (when needed)
- Component-specific styles for complex layouts
- Animation and transition definitions
- Custom properties for dynamic theming

### 3. Styled Components (optional)
- Dynamic styling based on props
- Theme-aware component styling
- Runtime style generation for complex cases

## Accessibility Implementation

### 1. Semantic HTML
- Proper button and input elements
- Landmark regions for navigation
- Heading hierarchy for screen readers

### 2. ARIA Attributes
- `aria-label` for button descriptions
- `aria-live` for dynamic content updates
- `aria-pressed` for toggle states
- `role` attributes for custom components

### 3. Keyboard Navigation
- Tab order management
- Focus indicators
- Keyboard shortcuts
- Escape key handling

## Performance Optimizations

### 1. React.memo
- Memoize expensive components
- Custom comparison functions for complex props
- Prevent unnecessary re-renders

### 2. useMemo and useCallback
- Memoize expensive calculations
- Stable callback references
- Optimize dependency arrays

### 3. Code Splitting
- Lazy load calculator modes
- Dynamic imports for large components
- Suspense boundaries for loading states

### 4. Virtual Scrolling
- Efficient rendering of large history lists
- Windowing for memory optimization
- Smooth scrolling performance

## Testing Strategy

### 1. Unit Tests
- Individual component testing
- Props and state validation
- Event handler testing
- Accessibility testing

### 2. Integration Tests
- Component interaction testing
- State management integration
- Keyboard navigation testing
- Theme switching testing

### 3. Visual Regression Tests
- Component appearance validation
- Theme consistency testing
- Responsive design verification
- Animation testing

## Component Development Guidelines

### 1. Single Responsibility
- Each component has one clear purpose
- Minimal coupling between components
- Clear interfaces and contracts

### 2. Composition over Inheritance
- Favor component composition
- Higher-order components for cross-cutting concerns
- Render props for flexible component APIs

### 3. TypeScript Best Practices
- Strict type definitions for all props
- Generic components where appropriate
- Proper error handling and validation

### 4. Documentation
- JSDoc comments for all public APIs
- Storybook stories for component showcase
- Usage examples and best practices

This component architecture provides a solid foundation for building a maintainable, scalable, and accessible calculator application with React and TypeScript.