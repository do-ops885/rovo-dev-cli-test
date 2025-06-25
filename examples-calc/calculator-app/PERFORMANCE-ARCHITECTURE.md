# Performance Architecture

## Overview
This document outlines the performance optimization strategies and architecture for the modular calculator application, ensuring smooth user experience across all devices and usage scenarios.

## Performance Goals

### 1. Core Metrics
- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5 seconds

### 2. User Experience Targets
- **Button Response Time**: < 16ms (60 FPS)
- **Calculation Speed**: < 10ms for basic operations
- **Mode Switching**: < 200ms transition time
- **History Loading**: < 500ms for 1000 entries
- **Memory Usage**: < 50MB baseline, < 100MB with plugins

### 3. Device Support
- **Mobile Devices**: Smooth performance on mid-range devices (2GB RAM)
- **Desktop**: Optimal performance on modern browsers
- **Tablets**: Responsive design with touch optimization
- **Low-end Devices**: Graceful degradation with reduced features

## Bundle Optimization

### 1. Code Splitting Strategy
```typescript
// Route-based code splitting
const BasicCalculator = lazy(() => import('./components/BasicCalculator'));
const ScientificCalculator = lazy(() => import('./components/ScientificCalculator'));
const ProgrammerCalculator = lazy(() => import('./components/ProgrammerCalculator'));

// Feature-based code splitting
const HistoryPanel = lazy(() => import('./components/HistoryPanel'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const ThemeSelector = lazy(() => import('./components/ThemeSelector'));

// Plugin system code splitting
const PluginManager = lazy(() => import('./plugins/PluginManager'));

// App.tsx
function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<BasicCalculator />} />
          <Route path="/scientific" element={<ScientificCalculator />} />
          <Route path="/programmer" element={<ProgrammerCalculator />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 2. Bundle Analysis and Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@headlessui/react', 'framer-motion'],
          'math-vendor': ['mathjs', 'decimal.js'],
          
          // Feature chunks
          'calculator-core': [
            './src/stores/calculatorStore.ts',
            './src/utils/mathOperations.ts'
          ],
          'calculator-ui': [
            './src/components/Display',
            './src/components/ButtonGrid'
          ],
          'calculator-advanced': [
            './src/components/ScientificFunctions',
            './src/components/ProgrammerFunctions'
          ]
        }
      }
    },
    
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    
    // Enable tree shaking
    treeshake: true,
    
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  
  // Enable compression
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' })
  ]
});
```

### 3. Asset Optimization
```typescript
// Image optimization
const optimizeImages = {
  // Use WebP format with fallbacks
  formats: ['webp', 'png', 'jpg'],
  
  // Responsive images
  sizes: [320, 640, 960, 1280, 1920],
  
  // Lazy loading
  loading: 'lazy' as const,
  
  // Compression settings
  quality: 85,
  progressive: true
};

// Icon optimization using SVG sprites
const IconSprite: React.FC = () => (
  <svg style={{ display: 'none' }}>
    <defs>
      <symbol id="icon-plus" viewBox="0 0 24 24">
        <path d="M12 4v16m8-8H4" />
      </symbol>
      <symbol id="icon-minus" viewBox="0 0 24 24">
        <path d="M4 12h16" />
      </symbol>
      {/* More icons */}
    </defs>
  </svg>
);

// Font optimization
const fontOptimization = {
  preload: ['Inter-Regular.woff2', 'Inter-Medium.woff2'],
  display: 'swap',
  subset: 'latin',
  unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153'
};
```

## React Performance Optimization

### 1. Component Memoization
```typescript
// Memoize expensive components
const Display = memo(({ value, expression, isError }: DisplayProps) => {
  return (
    <div className="calculator-display">
      <div className="expression">{expression}</div>
      <div className={`value ${isError ? 'error' : ''}`}>
        {value}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.value === nextProps.value &&
    prevProps.expression === nextProps.expression &&
    prevProps.isError === nextProps.isError
  );
});

// Memoize button grid to prevent unnecessary re-renders
const ButtonGrid = memo(({ layout, onButtonPress }: ButtonGridProps) => {
  const memoizedButtons = useMemo(() => {
    return layout.buttons.map(button => (
      <Button
        key={button.id}
        {...button}
        onPress={onButtonPress}
      />
    ));
  }, [layout.buttons, onButtonPress]);
  
  return <div className="button-grid">{memoizedButtons}</div>;
});

// Memoize individual buttons
const Button = memo(({ value, label, onPress, variant }: ButtonProps) => {
  const handlePress = useCallback(() => {
    onPress(value);
  }, [value, onPress]);
  
  return (
    <button
      className={`calculator-button ${variant}`}
      onClick={handlePress}
      aria-label={label}
    >
      {label}
    </button>
  );
});
```

### 2. State Optimization
```typescript
// Optimize Zustand store subscriptions
const useCalculatorDisplay = () => {
  // Subscribe only to display-related state
  return useCalculatorStore(
    useCallback((state) => ({
      currentValue: state.currentValue,
      expression: state.expression,
      isError: state.isError,
      errorMessage: state.errorMessage
    }), []),
    shallow
  );
};

// Optimize derived state with selectors
const useFormattedValue = () => {
  return useCalculatorStore(
    useCallback((state) => {
      if (state.isError) return 'Error';
      
      const value = parseFloat(state.currentValue);
      if (isNaN(value)) return '0';
      
      // Expensive formatting operation - memoized
      return formatNumber(value, {
        precision: state.precision,
        scientific: state.scientificNotation,
        thousandsSeparator: state.thousandsSeparator
      });
    }, []),
    (a, b) => a === b // Prevent re-renders for same formatted value
  );
};

// Debounce expensive operations
const useDebouncedCalculation = () => {
  const calculate = useCalculatorStore(state => state.calculate);
  
  return useMemo(
    () => debounce(calculate, 100),
    [calculate]
  );
};
```

### 3. Virtual Scrolling for History
```typescript
// Virtual scrolling for large history lists
const VirtualizedHistory: React.FC<HistoryProps> = ({ calculations }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: calculations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 5 // Render 5 extra items for smooth scrolling
  });
  
  return (
    <div
      ref={parentRef}
      className="history-container"
      style={{ height: '400px', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const calculation = calculations[virtualItem.index];
          
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <HistoryItem calculation={calculation} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

## Mathematical Operations Optimization

### 1. High-Precision Arithmetic
```typescript
// Use Decimal.js for precise calculations
import { Decimal } from 'decimal.js';

class PrecisionCalculator {
  private precision: number;
  
  constructor(precision: number = 20) {
    this.precision = precision;
    Decimal.set({ precision });
  }
  
  // Optimized basic operations
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
  
  // Memoized expensive operations
  private memoizedOperations = new Map<string, string>();
  
  power(base: string | number, exponent: string | number): string {
    const key = `${base}^${exponent}`;
    
    if (this.memoizedOperations.has(key)) {
      return this.memoizedOperations.get(key)!;
    }
    
    const result = new Decimal(base).pow(new Decimal(exponent)).toString();
    this.memoizedOperations.set(key, result);
    
    return result;
  }
  
  // Optimized trigonometric functions with lookup tables
  private trigCache = new Map<string, number>();
  
  sin(angle: number, unit: 'degrees' | 'radians' = 'radians'): number {
    const radians = unit === 'degrees' ? (angle * Math.PI) / 180 : angle;
    const key = `sin_${radians.toFixed(10)}`;
    
    if (this.trigCache.has(key)) {
      return this.trigCache.get(key)!;
    }
    
    const result = Math.sin(radians);
    this.trigCache.set(key, result);
    
    return result;
  }
}
```

### 2. Expression Parser Optimization
```typescript
// Optimized expression parser with caching
class ExpressionParser {
  private parseCache = new LRUCache<string, ParsedExpression>(1000);
  
  parse(expression: string): ParsedExpression {
    // Check cache first
    if (this.parseCache.has(expression)) {
      return this.parseCache.get(expression)!;
    }
    
    // Tokenize expression
    const tokens = this.tokenize(expression);
    
    // Parse tokens into AST
    const ast = this.parseTokens(tokens);
    
    // Optimize AST
    const optimizedAst = this.optimizeAST(ast);
    
    const result: ParsedExpression = {
      ast: optimizedAst,
      variables: this.extractVariables(optimizedAst),
      complexity: this.calculateComplexity(optimizedAst)
    };
    
    // Cache result
    this.parseCache.set(expression, result);
    
    return result;
  }
  
  private optimizeAST(ast: ASTNode): ASTNode {
    // Constant folding
    ast = this.foldConstants(ast);
    
    // Common subexpression elimination
    ast = this.eliminateCommonSubexpressions(ast);
    
    // Algebraic simplification
    ast = this.simplifyAlgebraically(ast);
    
    return ast;
  }
  
  private foldConstants(node: ASTNode): ASTNode {
    if (node.type === 'binary' && 
        node.left.type === 'number' && 
        node.right.type === 'number') {
      
      const leftValue = node.left.value;
      const rightValue = node.right.value;
      
      let result: number;
      switch (node.operator) {
        case '+': result = leftValue + rightValue; break;
        case '-': result = leftValue - rightValue; break;
        case '*': result = leftValue * rightValue; break;
        case '/': result = leftValue / rightValue; break;
        default: return node;
      }
      
      return { type: 'number', value: result };
    }
    
    return node;
  }
}
```

## Memory Management

### 1. Memory Leak Prevention
```typescript
// Cleanup utilities
class MemoryManager {
  private cleanupTasks: (() => void)[] = [];
  private intervals: number[] = [];
  private timeouts: number[] = [];
  private eventListeners: Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
  }> = [];
  
  // Safe interval creation
  setInterval(callback: () => void, delay: number): number {
    const id = window.setInterval(callback, delay);
    this.intervals.push(id);
    return id;
  }
  
  // Safe timeout creation
  setTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(callback, delay);
    this.timeouts.push(id);
    return id;
  }
  
  // Safe event listener addition
  addEventListener(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options);
    this.eventListeners.push({ element, event, handler });
  }
  
  // Cleanup all resources
  cleanup(): void {
    // Clear intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];
    
    // Clear timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];
    
    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    
    // Run custom cleanup tasks
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
  
  // Add custom cleanup task
  addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }
}

// Hook for automatic cleanup
const useMemoryManager = () => {
  const memoryManager = useRef(new MemoryManager());
  
  useEffect(() => {
    return () => {
      memoryManager.current.cleanup();
    };
  }, []);
  
  return memoryManager.current;
};
```

### 2. History Management with Size Limits
```typescript
// Efficient history storage with automatic cleanup
class HistoryManager {
  private maxSize: number;
  private compressionThreshold: number;
  
  constructor(maxSize: number = 1000, compressionThreshold: number = 500) {
    this.maxSize = maxSize;
    this.compressionThreshold = compressionThreshold;
  }
  
  addCalculation(calculation: CalculationHistory): void {
    const history = this.getHistory();
    
    // Add new calculation
    history.unshift(calculation);
    
    // Compress old entries if threshold reached
    if (history.length > this.compressionThreshold) {
      this.compressOldEntries(history);
    }
    
    // Remove excess entries
    if (history.length > this.maxSize) {
      history.splice(this.maxSize);
    }
    
    this.saveHistory(history);
  }
  
  private compressOldEntries(history: CalculationHistory[]): void {
    // Compress entries older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (let i = this.compressionThreshold; i < history.length; i++) {
      const entry = history[i];
      
      if (entry.timestamp.getTime() < thirtyDaysAgo) {
        // Compress by removing detailed expression data
        history[i] = {
          ...entry,
          expression: this.compressExpression(entry.expression),
          metadata: undefined // Remove non-essential metadata
        };
      }
    }
  }
  
  private compressExpression(expression: string): string {
    // Simplify long expressions for storage efficiency
    if (expression.length > 100) {
      return expression.substring(0, 97) + '...';
    }
    return expression;
  }
}
```

## Rendering Performance

### 1. Animation Optimization
```typescript
// Optimized animations using requestAnimationFrame
class AnimationManager {
  private animationFrame: number | null = null;
  private animations = new Set<Animation>();
  
  animate(animation: Animation): void {
    this.animations.add(animation);
    
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(() => this.tick());
    }
  }
  
  private tick(): void {
    const now = performance.now();
    
    for (const animation of this.animations) {
      const progress = Math.min((now - animation.startTime) / animation.duration, 1);
      
      animation.update(progress);
      
      if (progress >= 1) {
        animation.complete();
        this.animations.delete(animation);
      }
    }
    
    if (this.animations.size > 0) {
      this.animationFrame = requestAnimationFrame(() => this.tick());
    } else {
      this.animationFrame = null;
    }
  }
}

// Button press animation with GPU acceleration
const AnimatedButton: React.FC<ButtonProps> = ({ children, onPress, ...props }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePress = useCallback(() => {
    setIsPressed(true);
    
    // Use GPU-accelerated transform instead of changing layout properties
    requestAnimationFrame(() => {
      setTimeout(() => setIsPressed(false), 150);
    });
    
    onPress();
  }, [onPress]);
  
  return (
    <button
      {...props}
      className={`calculator-button ${isPressed ? 'pressed' : ''}`}
      onClick={handlePress}
      style={{
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s ease-out',
        willChange: 'transform' // Hint for GPU acceleration
      }}
    >
      {children}
    </button>
  );
};
```

### 2. Layout Optimization
```typescript
// Prevent layout thrashing with CSS containment
const CalculatorLayout: React.FC = ({ children }) => {
  return (
    <div
      className="calculator-layout"
      style={{
        contain: 'layout style paint', // CSS containment
        willChange: 'auto', // Let browser optimize
        transform: 'translateZ(0)' // Force GPU layer
      }}
    >
      {children}
    </div>
  );
};

// Optimize grid layout for button grid
const ButtonGrid: React.FC<ButtonGridProps> = ({ buttons }) => {
  return (
    <div
      className="button-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        contain: 'layout', // Contain layout calculations
        contentVisibility: 'auto' // Only render visible content
      }}
    >
      {buttons.map((button, index) => (
        <Button
          key={button.id}
          {...button}
          style={{
            gridArea: button.gridArea,
            contain: 'layout style paint'
          }}
        />
      ))}
    </div>
  );
};
```

## Performance Monitoring

### 1. Real-time Performance Metrics
```typescript
// Performance monitoring service
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: [],
    calculationTime: [],
    memoryUsage: [],
    bundleSize: 0
  };
  
  // Monitor component render performance
  measureRender<T>(component: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.metrics.renderTime.push({
      component,
      duration: end - start,
      timestamp: Date.now()
    });
    
    // Keep only recent measurements
    if (this.metrics.renderTime.length > 100) {
      this.metrics.renderTime.shift();
    }
    
    return result;
  }
  
  // Monitor calculation performance
  measureCalculation<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.metrics.calculationTime.push({
      operation,
      duration: end - start,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  // Monitor memory usage
  measureMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage.push({
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });
    }
  }
  
  // Get performance report
  getReport(): PerformanceReport {
    return {
      averageRenderTime: this.calculateAverage(this.metrics.renderTime.map(m => m.duration)),
      averageCalculationTime: this.calculateAverage(this.metrics.calculationTime.map(m => m.duration)),
      memoryTrend: this.analyzeMemoryTrend(),
      slowestComponents: this.getSlowComponents(),
      recommendations: this.generateRecommendations()
    };
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const avgRender = this.calculateAverage(this.metrics.renderTime.map(m => m.duration));
    if (avgRender > 16) {
      recommendations.push('Consider memoizing components with slow render times');
    }
    
    const avgCalc = this.calculateAverage(this.metrics.calculationTime.map(m => m.duration));
    if (avgCalc > 10) {
      recommendations.push('Optimize mathematical operations or use Web Workers');
    }
    
    return recommendations;
  }
}

// React hook for performance monitoring
const usePerformanceMonitor = () => {
  const monitor = useRef(new PerformanceMonitor());
  
  const measureRender = useCallback((component: string, fn: () => void) => {
    return monitor.current.measureRender(component, fn);
  }, []);
  
  const measureCalculation = useCallback((operation: string, fn: () => any) => {
    return monitor.current.measureCalculation(operation, fn);
  }, []);
  
  return { measureRender, measureCalculation, getReport: () => monitor.current.getReport() };
};
```

### 2. Performance Budget and Alerts
```typescript
// Performance budget configuration
const PERFORMANCE_BUDGET = {
  maxBundleSize: 500 * 1024, // 500KB
  maxRenderTime: 16, // 16ms for 60fps
  maxCalculationTime: 10, // 10ms
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  maxLCP: 2500, // 2.5s
  maxFID: 100 // 100ms
};

class PerformanceBudgetMonitor {
  private violations: BudgetViolation[] = [];
  
  checkBudget(metrics: PerformanceMetrics): BudgetViolation[] {
    const violations: BudgetViolation[] = [];
    
    // Check render time budget
    const avgRenderTime = this.calculateAverage(metrics.renderTime.map(m => m.duration));
    if (avgRenderTime > PERFORMANCE_BUDGET.maxRenderTime) {
      violations.push({
        type: 'render-time',
        actual: avgRenderTime,
        budget: PERFORMANCE_BUDGET.maxRenderTime,
        severity: 'warning'
      });
    }
    
    // Check calculation time budget
    const avgCalculationTime = this.calculateAverage(metrics.calculationTime.map(m => m.duration));
    if (avgCalculationTime > PERFORMANCE_BUDGET.maxCalculationTime) {
      violations.push({
        type: 'calculation-time',
        actual: avgCalculationTime,
        budget: PERFORMANCE_BUDGET.maxCalculationTime,
        severity: 'error'
      });
    }
    
    // Check memory usage budget
    const latestMemory = metrics.memoryUsage[metrics.memoryUsage.length - 1];
    if (latestMemory && latestMemory.used > PERFORMANCE_BUDGET.maxMemoryUsage) {
      violations.push({
        type: 'memory-usage',
        actual: latestMemory.used,
        budget: PERFORMANCE_BUDGET.maxMemoryUsage,
        severity: 'critical'
      });
    }
    
    return violations;
  }
}
```

This performance architecture ensures the calculator application delivers optimal user experience across all devices and usage scenarios, with comprehensive monitoring and optimization strategies in place.