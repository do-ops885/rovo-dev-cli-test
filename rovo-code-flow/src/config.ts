/**
 * Configuration management for rovo-code-flow
 */

import fs from "fs";
import path from "path";
import os from "os";
import { ConfigValidationError } from "./errors";

export class Config {
  private configPath: string;
  private config: Record<string, any> = {};

  constructor(configPath?: string) {
    this.configPath =
      configPath || path.join(os.homedir(), ".rovo-code-flow", "config.json");
    this.load();
  }

  /**
   * Load configuration from file
   */
  private load(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8");
        this.config = JSON.parse(data);
      } else {
        // Create default config
        this.config = {
          sparc: {
            enabled: true,
            modes: ["architect", "coder", "tdd", "security", "devops"],
          },
          event: {
            enabled: false,
            roles: ["modeler", "timeline", "ui", "state", "mapper"],
          },
          ui: {
            enabled: false,
            port: 3000,
          },
          memory: {
            persistence: true,
            encryptionEnabled: false,
          },
        };
        this.save();
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
    }
  }

  /**
   * Save configuration to file
   */
  public save(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  }

  /**
   * Get a configuration value
   */
  public get(key: string, defaultValue?: any): any {
    const parts = key.split(".");
    let current = this.config;

    for (const part of parts) {
      if (current[part] === undefined) {
        return defaultValue;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Set a configuration value
   */
  public set(key: string, value: any): void {
    const parts = key.split(".");
    let current = this.config;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
    this.save();
  }

  /**
   * Get the entire configuration
   */
  public getAll(): Record<string, any> {
    return this.config;
  }

  /**
   * Validate configuration against a schema
   * @param schema Validation schema object
   * @throws ConfigValidationError if validation fails
   */
  public validate(schema: Record<string, any>): void {
    const errors: string[] = [];

    // Validate configuration against schema
    this.validateObject(this.config, schema, "", errors);

    if (errors.length > 0) {
      throw new ConfigValidationError(
        `Configuration validation failed: ${errors.join("; ")}`,
        {
          context: { errors },
        },
      );
    }
  }

  /**
   * Validate an object against a schema
   * @param obj Object to validate
   * @param schema Schema to validate against
   * @param path Current path in the object
   * @param errors Array to collect validation errors
   */
  private validateObject(
    obj: Record<string, any>,
    schema: Record<string, any>,
    path: string,
    errors: string[],
  ): void {
    // Check required fields
    if (schema.$required && Array.isArray(schema.$required)) {
      for (const field of schema.$required) {
        if (obj[field] === undefined) {
          errors.push(
            `Missing required field ${path ? path + "." : ""}${field}`,
          );
        }
      }
    }

    // Check each field in the schema
    for (const key in schema) {
      if (key.startsWith("$")) continue; // Skip special schema fields

      const fieldPath = path ? `${path}.${key}` : key;
      const fieldSchema = schema[key];
      const fieldValue = obj[key];

      // Skip validation if field doesn't exist and isn't required
      if (fieldValue === undefined) {
        if (schema.$required && schema.$required.includes(key)) {
          errors.push(`Missing required field ${fieldPath}`);
        }
        continue;
      }

      // Validate field type
      if (fieldSchema.$type) {
        const expectedType = fieldSchema.$type;
        const actualType = Array.isArray(fieldValue)
          ? "array"
          : typeof fieldValue;

        if (expectedType !== actualType) {
          errors.push(
            `Field ${fieldPath} should be of type ${expectedType}, but got ${actualType}`,
          );
        }
      }

      // Validate nested objects
      if (
        fieldSchema.$type === "object" &&
        typeof fieldValue === "object" &&
        !Array.isArray(fieldValue)
      ) {
        this.validateObject(fieldValue, fieldSchema, fieldPath, errors);
      }

      // Validate array items
      if (
        fieldSchema.$type === "array" &&
        Array.isArray(fieldValue) &&
        fieldSchema.$items
      ) {
        for (let i = 0; i < fieldValue.length; i++) {
          const itemPath = `${fieldPath}[${i}]`;
          const item = fieldValue[i];

          if (typeof fieldSchema.$items === "object") {
            // Validate object items
            if (typeof item === "object" && !Array.isArray(item)) {
              this.validateObject(item, fieldSchema.$items, itemPath, errors);
            } else {
              errors.push(`Item at ${itemPath} should be an object`);
            }
          } else if (typeof fieldSchema.$items === "string") {
            // Validate primitive items
            const expectedType = fieldSchema.$items;
            const actualType = typeof item;

            if (expectedType !== actualType) {
              errors.push(
                `Item at ${itemPath} should be of type ${expectedType}, but got ${actualType}`,
              );
            }
          }
        }
      }

      // Validate enum values
      if (
        fieldSchema.$enum &&
        Array.isArray(fieldSchema.$enum) &&
        !fieldSchema.$enum.includes(fieldValue)
      ) {
        errors.push(
          `Field ${fieldPath} should be one of [${fieldSchema.$enum.join(", ")}], but got ${fieldValue}`,
        );
      }

      // Validate min/max for numbers
      if (typeof fieldValue === "number") {
        if (fieldSchema.$min !== undefined && fieldValue < fieldSchema.$min) {
          errors.push(
            `Field ${fieldPath} should be at least ${fieldSchema.$min}`,
          );
        }

        if (fieldSchema.$max !== undefined && fieldValue > fieldSchema.$max) {
          errors.push(
            `Field ${fieldPath} should be at most ${fieldSchema.$max}`,
          );
        }
      }

      // Validate string patterns
      if (typeof fieldValue === "string" && fieldSchema.$pattern) {
        const pattern = new RegExp(fieldSchema.$pattern);
        if (!pattern.test(fieldValue)) {
          errors.push(
            `Field ${fieldPath} does not match required pattern ${fieldSchema.$pattern}`,
          );
        }
      }
    }
  }
}
