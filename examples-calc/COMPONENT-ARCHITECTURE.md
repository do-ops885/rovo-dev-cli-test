# 🧩 Component Architecture - Modern Calculator Application

## 📋 Overview

This document outlines the comprehensive React component architecture for the modern calculator application. The architecture emphasizes reusability, accessibility, performance, and maintainability through a well-structured component hierarchy and design system.

## 🎯 Component Architecture Principles

### Core Principles
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Build complex UIs through component composition
- **Accessibility First**: WCAG 2.1 AA compliance built into every component
- **Performance Optimized**: Efficient rendering with minimal re-renders
- **Type Safety**: Full TypeScript support with strict prop types
- **Testability**: Components designed for easy testing and mocking

### Design Goals
- **Reusability**: Components that can be used across different contexts
- **Consistency**: Unified design language and interaction patterns
- **Flexibility**: Configurable components that adapt to different needs
- **Maintainability**: Clear structure and well-documented interfaces
- **Scalability**: Architecture that grows with feature requirements
- **Developer Experience**: Intuitive APIs and excellent TypeScript support

## 🏗️ Component Hierarchy

```
App
├── Providers
│   ├── ThemeProvider
│   ├── AccessibilityProvider
│   ├── ErrorBoundary
│   └── AnalyticsProvider
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── ModeSelector
│   │   └── SettingsButton
│   ├── MainContent
│   │   ├── Calculator
│   │   │   ├── Display
│   │   │   │   ├── PrimaryDisplay
│   │   │   │   ├── SecondaryDisplay
│   │   │   │   └── ExpressionDisplay
│   │   │   ├── InputPanel
│   │   │   │   ├── ButtonGrid
│   │   │   │   │   ├── NumberButtons
│   │   │   │   │   ├── OperatorButtons
│   │   │   │   │   └── FunctionButtons
│   │   │   │   └── SpecialControls
│   │   │   │       ├── ClearButton
│   │   │   │       ├── BackspaceButton
│   │   │   │       └── EqualsButton
│   │   │   └── PluginArea
│   │   │       ├── PluginRenderer
│   │   │       └── PluginControls
│   │   └── Sidebar
│   │       ├── HistoryPanel
│   │       ├── MemoryPanel
│   │       └── PluginPanel
│   └── Footer
│       ├── StatusBar
│       └── QuickActions
└── Modals
    ├── SettingsModal
    ├── HistoryModal
    ├── PluginModal
    └── HelpModal
```

## 🎨 Design System Components

### Foundation Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
  testId?: string;
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  onClick,
  onKeyDown,
  className,
  testId,
  ...ariaProps
}) => {
  const buttonClasses = cn(
    'button',
    `button--${variant}`,
    `button--${size}`,
    {
      'button--disabled': disabled,
      'button--loading': loading,
      'button--full-width': fullWidth,
      'button--icon-left': icon && iconPosition === 'left',
      'button--icon-right': icon && iconPosition === 'right'
    },
    className
  );

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(event);
  }, [disabled, loading, onClick]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Handle Enter and Space keys
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event as any);
    }
    
    onKeyDown?.(event);
  }, [disabled, loading, onClick, onKeyDown]);

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={testId}
      {...ariaProps}
    >
      {loading && <Spinner size="sm" />}
      {icon && iconPosition === 'left' && !loading && icon}
      <span className="button__content">{children}</span>
      {icon && iconPosition === 'right' && !loading && icon}
    </button>
  );
};
```

#### Display Component
```typescript
interface DisplayProps {
  value: string;
  expression?: string;
  result?: CalculationResult | null;
  mode: CalculatorMode;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right';
  showExpression?: boolean;
  showResult?: boolean;
  animated?: boolean;
  className?: string;
}

const Display: FC<DisplayProps> = ({
  value,
  expression,
  result,
  mode,
  fontSize = 'lg',
  alignment = 'right',
  showExpression = true,
  showResult = true,
  animated = true,
  className
}) => {
  const displayClasses = cn(
    'display',
    `display--${fontSize}`,
    `display--${alignment}`,
    `display--${mode}`,
    {
      'display--animated': animated
    },
    className
  );

  const formattedValue = useFormattedNumber(value, {
    precision: 10,
    notation: 'auto',
    locale: 'en-US'
  });

  return (
    <div className={displayClasses} role="region" aria-label="Calculator display">
      {showExpression && expression && (
        <div 
          className="display__expression"
          aria-label={`Expression: ${expression}`}
        >
          {expression}
        </div>
      )}
      
      <div 
        className="display__value"
        aria-label={`Current value: ${formattedValue}`}
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={animated ? { opacity: 0, y: -10 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={animated ? { opacity: 0, y: 10 } : false}
            transition={{ duration: 0.2 }}
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      
      {showResult && result && (
        <div 
          className="display__result"
          aria-label={`Result: ${result.value}`}
        >
          = {result.value}
        </div>
      )}
    </div>
  );
};
```

### Calculator-Specific Components

#### Calculator Button
```typescript
interface CalculatorButtonProps extends Omit<ButtonProps, 'variant'> {
  type: 'number' | 'operator' | 'function' | 'special';
  value: string;
  displayValue?: string;
  shortcut?: string;
  operation?: Operation;
  mathFunction?: MathFunction;
  gridArea?: string;
  highlighted?: boolean;
  pressed?: boolean;
}

const CalculatorButton: FC<CalculatorButtonProps> = ({
  type,
  value,
  displayValue,
  shortcut,
  operation,
  mathFunction,
  gridArea,
  highlighted = false,
  pressed = false,
  onClick,
  ...props
}) => {
  const { calculator } = useCalculatorStore();
  const { settings } = useSettingsStore();
  
  const buttonClasses = cn(
    'calc-button',
    `calc-button--${type}`,
    {
      'calc-button--highlighted': highlighted,
      'calc-button--pressed': pressed
    }
  );

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    // Play sound effect if enabled
    if (settings.input.soundEffects) {
      playButtonSound(type);
    }
    
    // Provide haptic feedback if enabled
    if (settings.input.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Handle different button types
    switch (type) {
      case 'number':
        calculator.actions.inputDigit(value);
        break;
      case 'operator':
        if (operation) {
          calculator.actions.performOperation(operation);
        }
        break;
      case 'function':
        if (mathFunction) {
          calculator.actions.performFunction(mathFunction);
        }
        break;
      case 'special':
        handleSpecialButton(value);
        break;
    }
    
    onClick?.(event);
  }, [type, value, operation, mathFunction, calculator, settings, onClick]);

  const ariaLabel = useMemo(() => {
    switch (type) {
      case 'number':
        return `Number ${displayValue || value}`;
      case 'operator':
        return `Operator ${operation?.name || displayValue || value}`;
      case 'function':
        return `Function ${mathFunction?.name || displayValue || value}`;
      case 'special':
        return getSpecialButtonLabel(value);
      default:
        return displayValue || value;
    }
  }, [type, value, displayValue, operation, mathFunction]);

  return (
    <Button
      className={buttonClasses}
      style={{ gridArea }}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={shortcut ? `Keyboard shortcut: ${shortcut}` : undefined}
      {...props}
    >
      {displayValue || value}
    </Button>
  );
};
```

#### Button Grid
```typescript
interface ButtonGridProps {
  mode: CalculatorMode;
  layout: ButtonLayout;
  className?: string;
}

const ButtonGrid: FC<ButtonGridProps> = ({
  mode,
  layout,
  className
}) => {
  const gridClasses = cn(
    'button-grid',
    `button-grid--${mode}`,
    className
  );

  const gridStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
    gridTemplateAreas: layout.areas.map(row => `"${row.join(' ')}"`).join(' ')
  }), [layout]);

  return (
    <div 
      className={gridClasses}
      style={gridStyle}
      role="grid"
      aria-label={`${mode} calculator buttons`}
    >
      {layout.buttons.map((button, index) => (
        <CalculatorButton
          key={`${button.value}-${index}`}
          type={button.type}
          value={button.value}
          displayValue={button.displayValue}
          shortcut={button.shortcut}
          operation={button.operation}
          mathFunction={button.mathFunction}
          gridArea={button.gridArea}
          size="lg"
        />
      ))}
    </div>
  );
};
```

### Layout Components

#### Calculator Layout
```typescript
interface CalculatorProps {
  mode?: CalculatorMode;
  className?: string;
}

const Calculator: FC<CalculatorProps> = ({
  mode: propMode,
  className
}) => {
  const { calculator } = useCalculatorStore();
  const { ui } = useUIStore();
  const { settings } = useSettingsStore();
  
  const currentMode = propMode || calculator.mode;
  const layout = useButtonLayout(currentMode);
  
  const calculatorClasses = cn(
    'calculator',
    `calculator--${currentMode}`,
    {
      'calculator--compact': settings.display.compactMode,
      'calculator--sidebar-open': ui.layout.sidebarOpen
    },
    className
  );

  // Keyboard event handling
  useKeyboardShortcuts({
    enabled: settings.input.keyboardShortcuts,
    mode: currentMode
  });

  // Gesture handling for touch devices
  useGestureHandling({
    enabled: settings.input.gestureSupport
  });

  return (
    <div className={calculatorClasses}>
      <div className="calculator__display-area">
        <Display
          value={calculator.currentValue}
          expression={calculator.expression}
          result={calculator.result}
          mode={currentMode}
          fontSize={settings.display.fontSize}
          animated={settings.display.animations}
        />
      </div>
      
      <div className="calculator__input-area">
        <ButtonGrid
          mode={currentMode}
          layout={layout}
        />
      </div>
      
      {ui.layout.sidebarOpen && (
        <div className="calculator__sidebar">
          <Sidebar />
        </div>
      )}
      
      <PluginArea mode={currentMode} />
    </div>
  );
};
```

#### Sidebar Component
```typescript
interface SidebarProps {
  className?: string;
}

const Sidebar: FC<SidebarProps> = ({ className }) => {
  const { ui } = useUIStore();
  const [activeTab, setActiveTab] = useState<SidebarTab>('history');
  
  const sidebarClasses = cn(
    'sidebar',
    {
      'sidebar--open': ui.layout.sidebarOpen
    },
    className
  );

  const tabs: SidebarTab[] = ['history', 'memory', 'plugins'];

  return (
    <aside className={sidebarClasses} aria-label="Calculator sidebar">
      <div className="sidebar__header">
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          aria-label="Sidebar navigation"
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => ui.actions.toggleSidebar()}
          aria-label="Close sidebar"
        >
          <CloseIcon />
        </Button>
      </div>
      
      <div className="sidebar__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'history' && <HistoryPanel />}
            {activeTab === 'memory' && <MemoryPanel />}
            {activeTab === 'plugins' && <PluginPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
};
```

### Plugin Components

#### Plugin Renderer
```typescript
interface PluginRendererProps {
  pluginId: string;
  mode: CalculatorMode;
  className?: string;
}

const PluginRenderer: FC<PluginRendererProps> = ({
  pluginId,
  mode,
  className
}) => {
  const { plugins } = usePluginStore();
  const plugin = plugins.installed.find(p => p.id === pluginId);
  
  const [PluginComponent, setPluginComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!plugin) return;

    const loadPlugin = async () => {
      try {
        const component = await plugin.loadComponent();
        setPluginComponent(() => component);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error(`Failed to load plugin ${pluginId}:`, err);
      }
    };

    loadPlugin();
  }, [plugin, pluginId]);

  if (error) {
    return (
      <div className="plugin-error">
        <h3>Plugin Error</h3>
        <p>Failed to load plugin: {pluginId}</p>
        <details>
          <summary>Error details</summary>
          <pre>{error.message}</pre>
        </details>
      </div>
    );
  }

  if (!PluginComponent) {
    return (
      <div className="plugin-loading">
        <Spinner />
        <span>Loading plugin...</span>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={<PluginErrorFallback pluginId={pluginId} />}
      onError={(error) => {
        console.error(`Plugin ${pluginId} crashed:`, error);
      }}
    >
      <div className={cn('plugin-container', className)}>
        <PluginComponent mode={mode} />
      </div>
    </ErrorBoundary>
  );
};
```

### Accessibility Components

#### Screen Reader Announcements
```typescript
interface AnnouncementProps {
  message: string;
  priority: 'polite' | 'assertive';
  delay?: number;
}

const Announcement: FC<AnnouncementProps> = ({
  message,
  priority,
  delay = 0
}) => {
  const [shouldAnnounce, setShouldAnnounce] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnnounce(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (shouldAnnounce) {
      const timer = setTimeout(() => {
        setShouldAnnounce(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [shouldAnnounce]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {shouldAnnounce ? message : ''}
    </div>
  );
};
```

#### Focus Management
```typescript
const FocusManager: FC<{ children: ReactNode }> = ({ children }) => {
  const focusRef = useRef<HTMLDivElement>(null);
  const { accessibility } = useAccessibilityStore();

  useEffect(() => {
    const handleFocusManagement = (event: KeyboardEvent) => {
      // Handle focus trapping for modals
      if (accessibility.focusTrapped && event.key === 'Tab') {
        trapFocus(event, focusRef.current);
      }
      
      // Handle skip links
      if (event.key === 'Enter' && event.target instanceof HTMLElement) {
        const skipTarget = event.target.getAttribute('data-skip-to');
        if (skipTarget) {
          const target = document.getElementById(skipTarget);
          target?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleFocusManagement);
    return () => document.removeEventListener('keydown', handleFocusManagement);
  }, [accessibility.focusTrapped]);

  return (
    <div ref={focusRef} className="focus-manager">
      {children}
    </div>
  );
};
```

## 🎨 Styling Architecture

### CSS-in-JS with Styled Components
```typescript
// Theme-aware styled components
const StyledButton = styled.button<{ variant: ButtonVariant; size: ButtonSize }>`
  ${({ theme, variant, size }) => css`
    /* Base styles */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: ${theme.radii[size]};
    font-family: ${theme.fonts.ui};
    font-weight: ${theme.fontWeights.medium};
    cursor: pointer;
    transition: all ${theme.transitions.fast};
    
    /* Size variants */
    ${size === 'sm' && css`
      padding: ${theme.space[2]} ${theme.space[3]};
      font-size: ${theme.fontSizes.sm};
      min-height: ${theme.sizes[8]};
    `}
    
    ${size === 'md' && css`
      padding: ${theme.space[3]} ${theme.space[4]};
      font-size: ${theme.fontSizes.md};
      min-height: ${theme.sizes[10]};
    `}
    
    /* Variant styles */
    ${variant === 'primary' && css`
      background-color: ${theme.colors.primary[500]};
      color: ${theme.colors.white};
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary[600]};
      }
      
      &:focus-visible {
        outline: 2px solid ${theme.colors.primary[300]};
        outline-offset: 2px;
      }
    `}
    
    /* States */
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* High contrast mode */
    @media (prefers-contrast: high) {
      border: 2px solid currentColor;
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `}
`;
```

### Tailwind CSS Classes
```typescript
// Utility-first approach with Tailwind
const buttonClasses = {
  base: 'inline-flex items-center justify-center border-0 rounded font-medium cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  
  variants: {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-300',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-300',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-300'
  },
  
  sizes: {
    sm: 'px-3 py-2 text-sm min-h-8',
    md: 'px-4 py-3 text-base min-h-10',
    lg: 'px-6 py-4 text-lg min-h-12'
  },
  
  states: {
    disabled: 'opacity-50 cursor-not-allowed',
    loading: 'cursor-wait'
  }
};
```

## 🧪 Component Testing

### Testing Utilities
```typescript
// Custom render function with providers
const renderWithProviders = (
  ui: ReactElement,
  options?: {
    initialState?: Partial<ApplicationState>;
    theme?: Theme;
    ...RenderOptions;
  }
) => {
  const { initialState, theme = defaultTheme, ...renderOptions } = options || {};
  
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
      <StoreProvider initialState={initialState}>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </StoreProvider>
    </ThemeProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Component test example
describe('CalculatorButton', () => {
  it('should handle number input correctly', async () => {
    const user = userEvent.setup();
    const mockInputDigit = jest.fn();
    
    renderWithProviders(
      <CalculatorButton
        type="number"
        value="5"
        displayValue="5"
      />,
      {
        initialState: {
          calculator: {
            actions: { inputDigit: mockInputDigit }
          }
        }
      }
    );
    
    const button = screen.getByRole('button', { name: /number 5/i });
    await user.click(button);
    
    expect(mockInputDigit).toHaveBeenCalledWith('5');
  });
  
  it('should be accessible', async () => {
    renderWithProviders(
      <CalculatorButton
        type="operator"
        value="+"
        displayValue="+"
        operation={Operations.ADD}
      />
    );
    
    const button = screen.getByRole('button');
    
    // Check ARIA attributes
    expect(button).toHaveAttribute('aria-label', 'Operator Add');
    
    // Check keyboard navigation
    button.focus();
    expect(button).toHaveFocus();
    
    // Check color contrast
    const styles = getComputedStyle(button);
    const contrastRatio = calculateContrastRatio(
      styles.color,
      styles.backgroundColor
    );
    expect(contrastRatio).toBeGreaterThan(4.5); // WCAG AA standard
  });
});
```

### Visual Regression Testing
```typescript
// Storybook stories for visual testing
export default {
  title: 'Components/CalculatorButton',
  component: CalculatorButton,
  parameters: {
    layout: 'centered'
  }
} as Meta<typeof CalculatorButton>;

export const NumberButton: Story = {
  args: {
    type: 'number',
    value: '5',
    displayValue: '5'
  }
};

export const OperatorButton: Story = {
  args: {
    type: 'operator',
    value: '+',
    displayValue: '+',
    operation: Operations.ADD
  }
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-2">
      {buttonVariants.map((variant) => (
        <CalculatorButton key={variant.value} {...variant} />
      ))}
    </div>
  )
};
```

## 📊 Performance Optimization

### Component Optimization
```typescript
// Memoized components for performance
const MemoizedCalculatorButton = memo(CalculatorButton, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.pressed === nextProps.pressed &&
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.disabled === nextProps.disabled
  );
});

// Virtualized lists for large datasets
const VirtualizedHistory = () => {
  const { history } = useHistoryStore();
  
  return (
    <FixedSizeList
      height={400}
      itemCount={history.calculations.length}
      itemSize={60}
      itemData={history.calculations}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <HistoryEntry entry={data[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};

// Lazy loading for heavy components
const LazyPluginRenderer = lazy(() => import('./PluginRenderer'));

const PluginArea = ({ mode }: { mode: CalculatorMode }) => (
  <Suspense fallback={<PluginSkeleton />}>
    <LazyPluginRenderer mode={mode} />
  </Suspense>
);
```

## 🎯 Best Practices

### Component Design Guidelines
1. **Single Responsibility**: Each component should have one clear purpose
2. **Prop Interface**: Use TypeScript interfaces for all props with clear documentation
3. **Accessibility**: Include ARIA attributes and keyboard support by default
4. **Performance**: Use React.memo, useMemo, and useCallback appropriately
5. **Testing**: Write comprehensive tests for all component behavior
6. **Documentation**: Document complex components with examples

### Common Patterns
```typescript
// Pattern: Compound components
const Calculator = {
  Root: CalculatorRoot,
  Display: CalculatorDisplay,
  ButtonGrid: CalculatorButtonGrid,
  Button: CalculatorButton,
  Sidebar: CalculatorSidebar
};

// Usage
<Calculator.Root>
  <Calculator.Display />
  <Calculator.ButtonGrid>
    <Calculator.Button type="number" value="1" />
    <Calculator.Button type="operator" value="+" />
  </Calculator.ButtonGrid>
  <Calculator.Sidebar />
</Calculator.Root>

// Pattern: Render props
const DataProvider = ({ children, ...props }) => {
  const data = useData(props);
  return children(data);
};

// Pattern: Custom hooks for component logic
const useCalculatorButton = (type: ButtonType, value: string) => {
  const { calculator } = useCalculatorStore();
  const { settings } = useSettingsStore();
  
  const handleClick = useCallback(() => {
    // Button logic here
  }, [type, value, calculator]);
  
  const ariaLabel = useMemo(() => {
    // Generate appropriate ARIA label
  }, [type, value]);
  
  return { handleClick, ariaLabel };
};
```

## 🎯 Conclusion

This component architecture provides a solid foundation for building a modern, accessible, and performant calculator application. The emphasis on reusability, type safety, and accessibility ensures that the application will be maintainable and usable by all users.

The modular design allows for easy extension and customization while maintaining consistency across the application. The comprehensive testing strategy ensures reliability and helps prevent regressions as the application evolves.