/**
 * Custom error classes for rovo-code-flow
 */

/**
 * Base error class for all rovo-code-flow errors
 * @class RovoError
 * @extends Error
 */
export class RovoError extends Error {
  /**
   * Error code for categorization and identification
   */
  public code: string;

  /**
   * Additional context information about the error
   */
  public context?: Record<string, any>;

  /**
   * @param message - Error message
   * @param options - Error options including cause, code, and context
   */
  constructor(
    message: string,
    options?: {
      cause?: Error;
      code?: string;
      context?: Record<string, any>;
    },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options?.code || "ROVO_ERROR";
    this.context = options?.context;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Get a formatted string representation of the error
   */
  public toString(): string {
    let result = `[${this.code}] ${this.message}`;

    if (this.context && Object.keys(this.context).length > 0) {
      result += `\nContext: ${JSON.stringify(this.context, null, 2)}`;
    }

    return result;
  }
}

/**
 * Error thrown when configuration validation fails
 * @class ConfigValidationError
 * @extends RovoError
 */
export class ConfigValidationError extends RovoError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, any>;
    },
  ) {
    super(message, {
      ...options,
      code: "CONFIG_VALIDATION_ERROR",
    });
  }
}

/**
 * Error thrown when plugin loading fails
 * @class PluginLoadError
 * @extends RovoError
 */
export class PluginLoadError extends RovoError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, any>;
    },
  ) {
    super(message, {
      ...options,
      code: "PLUGIN_LOAD_ERROR",
    });
  }
}

/**
 * Error thrown when API requests fail
 * @class ApiRequestError
 * @extends RovoError
 */
export class ApiRequestError extends RovoError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, any>;
      statusCode?: number;
      endpoint?: string;
    },
  ) {
    super(message, {
      ...options,
      code: "API_REQUEST_ERROR",
      context: {
        ...options?.context,
        statusCode: options?.statusCode,
        endpoint: options?.endpoint,
      },
    });
  }
}

/**
 * Error thrown when logging operations fail
 * @class LoggingError
 * @extends RovoError
 */
export class LoggingError extends RovoError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, any>;
    },
  ) {
    super(message, {
      ...options,
      code: "LOGGING_ERROR",
    });
  }
}

/**
 * Error thrown when documentation operations fail
 * @class DocumentationError
 * @extends RovoError
 */
export class DocumentationError extends RovoError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, any>;
    },
  ) {
    super(message, {
      ...options,
      code: "DOCUMENTATION_ERROR",
    });
  }
}

/**
 * Error thrown when file path validation fails
 * @class FilePathValidationError
 * @extends RovoError
 */
export class FilePathValidationError extends RovoError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, any>;
      path?: string;
    },
  ) {
    super(message, {
      ...options,
      code: "FILE_PATH_VALIDATION_ERROR",
      context: {
        ...options?.context,
        path: options?.path,
      },
    });
  }
}
