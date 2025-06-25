# Calculator Commands Reference

## Overview
This document provides a comprehensive reference for all commands, shortcuts, and interactions available in the modular calculator application.

## Keyboard Commands

### Basic Input
| Key | Action | Description |
|-----|--------|-------------|
| `0-9` | Input Digit | Enter numeric digits |
| `.` | Decimal Point | Add decimal point to current number |
| `+` | Addition | Perform addition operation |
| `-` | Subtraction | Perform subtraction operation |
| `*` | Multiplication | Perform multiplication operation |
| `/` | Division | Perform division operation |
| `=` | Calculate | Execute calculation |
| `Enter` | Calculate | Execute calculation (alternative) |
| `%` | Percentage | Calculate percentage |

### Control Commands
| Key | Action | Description |
|-----|--------|-------------|
| `Escape` | Clear All | Clear calculator and reset state |
| `c` | Clear All | Clear calculator and reset state |
| `C` | Clear All | Clear calculator and reset state |
| `Backspace` | Delete | Remove last entered character |
| `Delete` | Clear Entry | Clear current entry |

### Function Keys
| Key | Action | Description |
|-----|--------|-------------|
| `F1` | Help | Show help documentation |
| `F2` | Settings | Open settings panel |
| `F3` | History | Toggle history panel |
| `F4` | Memory | Toggle memory panel |
| `F5` | Refresh | Reload application |
| `F11` | Fullscreen | Toggle fullscreen mode |

### Shortcuts with Modifiers

#### Ctrl/Cmd Shortcuts
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+C` | Copy | Copy current value to clipboard |
| `Ctrl+V` | Paste | Paste value from clipboard |
| `Ctrl+Z` | Undo | Undo last operation |
| `Ctrl+Y` | Redo | Redo last undone operation |
| `Ctrl+H` | History | Toggle calculation history |
| `Ctrl+M` | Memory | Toggle memory panel |
| `Ctrl+S` | Settings | Open settings panel |
| `Ctrl+T` | Theme | Cycle through themes |
| `Ctrl+R` | Reset | Reset calculator to initial state |
| `Ctrl+A` | Select All | Select all text in display |
| `Ctrl+,` | Preferences | Open preferences (macOS style) |

#### Alt Shortcuts
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Alt+1` | Basic Mode | Switch to basic calculator |
| `Alt+2` | Scientific Mode | Switch to scientific calculator |
| `Alt+3` | Programmer Mode | Switch to programmer calculator |
| `Alt+4` | Financial Mode | Switch to financial calculator |
| `Alt+5` | Graphing Mode | Switch to graphing calculator |
| `Alt+H` | History | Toggle history sidebar |
| `Alt+M` | Memory | Toggle memory sidebar |
| `Alt+T` | Theme Toggle | Toggle between light/dark theme |

#### Shift Shortcuts
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Shift+Delete` | Clear History | Clear all calculation history |
| `Shift+Escape` | Emergency Reset | Force reset all application state |
| `Shift+=` | Advanced Calculate | Show calculation steps |

### Scientific Calculator Commands
| Key | Function | Description |
|-----|----------|-------------|
| `s` | sin | Sine function |
| `o` | cos | Cosine function |
| `t` | tan | Tangent function |
| `l` | log | Logarithm base 10 |
| `n` | ln | Natural logarithm |
| `q` | sqrt | Square root |
| `p` | π (pi) | Insert pi constant |
| `e` | e | Insert Euler's number |
| `^` | Power | Exponentiation |
| `!` | Factorial | Factorial function |
| `(` | Open Parenthesis | Group operations |
| `)` | Close Parenthesis | Close grouping |

### Memory Commands
| Key | Action | Description |
|-----|--------|-------------|
| `Ctrl+M` | Memory Store | Store current value in memory |
| `Ctrl+R` | Memory Recall | Recall value from memory |
| `Ctrl+L` | Memory Clear | Clear memory |
| `Ctrl+P` | Memory Plus | Add current value to memory |
| `Ctrl+Q` | Memory Minus | Subtract current value from memory |

## Mouse/Touch Commands

### Button Interactions
| Action | Gesture | Description |
|--------|---------|-------------|
| Click | Single tap | Press button |
| Long Press | Hold 500ms+ | Access secondary function |
| Right Click | Context menu | Show button options |
| Double Click | Quick double tap | Repeat last operation |

### Display Interactions
| Action | Gesture | Description |
|--------|---------|-------------|
| Click | Single tap | Select display text |
| Double Click | Double tap | Select all display text |
| Long Press | Hold 1s+ | Show calculation details |
| Right Click | Context menu | Copy/paste options |

### Swipe Gestures
| Gesture | Action | Description |
|---------|--------|-------------|
| Swipe Left | Previous | Previous calculation in history |
| Swipe Right | Next | Next calculation in history |
| Swipe Up | History | Show calculation history |
| Swipe Down | Hide | Hide panels/overlays |
| Pinch In | Zoom Out | Decrease display font size |
| Pinch Out | Zoom In | Increase display font size |

### Multi-Touch Gestures
| Gesture | Action | Description |
|---------|--------|-------------|
| Two Finger Tap | Undo | Undo last operation |
| Three Finger Tap | Clear All | Clear calculator |
| Four Finger Swipe Up | Settings | Open settings |
| Four Finger Swipe Down | Close | Close current panel |

## Voice Commands (Future Feature)

### Basic Operations
| Command | Action | Description |
|---------|--------|-------------|
| "Calculate [expression]" | Calculate | Perform calculation |
| "Clear" | Clear | Clear calculator |
| "Undo" | Undo | Undo last operation |
| "Repeat" | Repeat | Repeat last calculation |

### Number Input
| Command | Action | Description |
|---------|--------|-------------|
| "Zero" / "Oh" | 0 | Input zero |
| "One" | 1 | Input one |
| "Two" | 2 | Input two |
| "Point" / "Decimal" | . | Decimal point |

### Operations
| Command | Action | Description |
|---------|--------|-------------|
| "Plus" / "Add" | + | Addition |
| "Minus" / "Subtract" | - | Subtraction |
| "Times" / "Multiply" | × | Multiplication |
| "Divided by" / "Divide" | ÷ | Division |
| "Equals" | = | Calculate result |

### Functions
| Command | Action | Description |
|---------|--------|-------------|
| "Square root of [number]" | √ | Square root |
| "Sine of [number]" | sin | Sine function |
| "Cosine of [number]" | cos | Cosine function |
| "Log of [number]" | log | Logarithm |

### Mode Switching
| Command | Action | Description |
|---------|--------|-------------|
| "Basic mode" | Mode switch | Switch to basic calculator |
| "Scientific mode" | Mode switch | Switch to scientific calculator |
| "Settings" | Settings | Open settings panel |
| "History" | History | Show calculation history |

## API Commands (For Developers)

### Calculator API
```typescript
// Basic operations
calculator.inputDigit('5');
calculator.inputOperator('+');
calculator.calculate();
calculator.clear();

// Advanced operations
calculator.inputFunction('sin', [30]);
calculator.setMode('scientific');
calculator.setPrecision(10);

// Memory operations
calculator.memoryStore();
calculator.memoryRecall();
calculator.memoryClear();

// State management
const state = calculator.getState();
calculator.setState(newState);
calculator.subscribe(callback);
```

### Plugin API
```typescript
// Plugin registration
pluginManager.register(myPlugin);
pluginManager.activate('plugin-id');

// Function registration
pluginAPI.registerFunction({
  name: 'myFunction',
  implementation: (args) => args[0] * 2
});

// Theme registration
pluginAPI.registerTheme({
  id: 'my-theme',
  colors: { ... }
});
```

### Event API
```typescript
// Event listening
calculator.on('calculation', (result) => {
  console.log('Result:', result);
});

calculator.on('error', (error) => {
  console.error('Error:', error);
});

calculator.on('modeChange', (mode) => {
  console.log('Mode changed to:', mode);
});
```

## URL Commands

### Deep Linking
| URL | Action | Description |
|-----|--------|-------------|
| `/#/basic` | Basic Mode | Open basic calculator |
| `/#/scientific` | Scientific Mode | Open scientific calculator |
| `/#/programmer` | Programmer Mode | Open programmer calculator |
| `/#/settings` | Settings | Open settings panel |
| `/#/history` | History | Open history panel |

### Query Parameters
| Parameter | Values | Description |
|-----------|--------|-------------|
| `?mode=` | basic, scientific, programmer | Set calculator mode |
| `?theme=` | light, dark, auto | Set theme |
| `?precision=` | 1-50 | Set decimal precision |
| `?angle=` | degrees, radians | Set angle unit |
| `?expression=` | URL encoded | Pre-fill expression |

### Examples
```
https://calculator.app/#/scientific?theme=dark&precision=15
https://calculator.app/?expression=sin(30)%2Bcos(60)
https://calculator.app/#/basic?mode=basic&theme=light
```

## Configuration Commands

### Settings API
```typescript
// Get settings
const settings = settingsStore.getSettings();

// Update settings
settingsStore.updateSetting('theme', 'dark');
settingsStore.updateSetting('precision', 15);
settingsStore.updateSetting('angleUnit', 'radians');

// Reset settings
settingsStore.resetSettings();

// Export/Import settings
const exported = settingsStore.exportSettings();
settingsStore.importSettings(exported);
```

### Theme Commands
```typescript
// Theme management
themeStore.setTheme('dark');
themeStore.createCustomTheme(themeDefinition);
themeStore.deleteTheme('custom-theme-id');

// Theme properties
const colors = themeStore.getColorPalette();
const typography = themeStore.getTypography();
```

## Accessibility Commands

### Screen Reader Commands
| Command | Action | Description |
|---------|--------|-------------|
| `Tab` | Navigate | Move to next interactive element |
| `Shift+Tab` | Navigate Back | Move to previous interactive element |
| `Space` | Activate | Activate focused button |
| `Enter` | Activate | Activate focused button |
| `Arrow Keys` | Navigate Grid | Navigate button grid |

### High Contrast Mode
| Command | Action | Description |
|---------|--------|-------------|
| `Ctrl+Alt+H` | Toggle High Contrast | Enable/disable high contrast theme |
| `Ctrl+Alt+L` | Large Text | Increase text size |
| `Ctrl+Alt+S` | Small Text | Decrease text size |

### Voice Announcements
| Setting | Description |
|---------|-------------|
| Calculation Results | Announce calculation results |
| Button Presses | Announce button presses |
| Mode Changes | Announce mode switches |
| Error Messages | Announce errors |

## Developer Commands

### Debug Mode
```typescript
// Enable debug mode
window.calculator.enableDebug();

// Debug information
window.calculator.getDebugInfo();
window.calculator.getPerformanceMetrics();
window.calculator.getStateHistory();

// Performance monitoring
window.calculator.startProfiling();
window.calculator.stopProfiling();
```

### Testing Commands
```typescript
// Test utilities
window.calculator.runTests();
window.calculator.simulateInput('1+2=');
window.calculator.validateState();

// Mock data
window.calculator.loadMockHistory();
window.calculator.loadMockSettings();
```

## Error Recovery Commands

### Emergency Reset
| Command | Action | Description |
|---------|--------|-------------|
| `Ctrl+Shift+R` | Hard Reset | Reset all application state |
| `Ctrl+Shift+C` | Clear Storage | Clear all local storage |
| `Ctrl+Shift+D` | Debug Mode | Enable debug mode |

### Safe Mode
| Command | Action | Description |
|---------|--------|-------------|
| `?safe=true` | Safe Mode | Load with minimal features |
| `?reset=true` | Reset Mode | Reset to defaults |
| `?debug=true` | Debug Mode | Enable debug features |

This comprehensive command reference ensures users and developers have complete access to all calculator functionality through multiple interaction methods.