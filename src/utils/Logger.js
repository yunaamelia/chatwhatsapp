/**
 * Enhanced Logger
 * Structured logging with levels, formatting, and filtering
 */

const fs = require("fs");
const path = require("path");

class Logger {
  constructor(context = "App") {
    this.context = context;
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4,
    };
    
    // Set log level from environment
    const envLevel = process.env.LOG_LEVEL || "INFO";
    this.currentLevel = this.levels[envLevel.toUpperCase()] || this.levels.INFO;
    
    // Log to file option
    this.logToFile = process.env.LOG_TO_FILE === "true";
    this.logDir = process.env.LOG_DIR || "./logs";
    
    if (this.logToFile) {
      this._ensureLogDir();
    }
  }

  /**
   * Ensure log directory exists
   * @private
   */
  _ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   * @private
   */
  _format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : "";
    
    let formatted = `${timestamp} ${level.padEnd(5)} ${contextStr} ${message}`;
    
    if (Object.keys(meta).length > 0) {
      formatted += ` ${JSON.stringify(meta)}`;
    }
    
    return formatted;
  }

  /**
   * Write to log file (async, non-blocking)
   * @private
   */
  _writeToFile(level, message) {
    if (!this.logToFile) return;
    
    try {
      const date = new Date().toISOString().split("T")[0];
      const logFile = path.join(this.logDir, `app-${date}.log`);
      // Use async append to avoid blocking event loop
      fs.promises.appendFile(logFile, message + "\n").catch((error) => {
        console.error("Failed to write to log file:", error.message);
      });
    } catch (error) {
      console.error("Failed to write to log file:", error.message);
    }
  }

  /**
   * Log error
   */
  error(message, meta = {}) {
    if (this.currentLevel < this.levels.ERROR) return;
    
    const formatted = this._format("ERROR", message, meta);
    console.error(formatted);
    this._writeToFile("ERROR", formatted);
  }

  /**
   * Log warning
   */
  warn(message, meta = {}) {
    if (this.currentLevel < this.levels.WARN) return;
    
    const formatted = this._format("WARN", message, meta);
    console.warn(formatted);
    this._writeToFile("WARN", formatted);
  }

  /**
   * Log info
   */
  info(message, meta = {}) {
    if (this.currentLevel < this.levels.INFO) return;
    
    const formatted = this._format("INFO", message, meta);
    console.log(formatted);
    this._writeToFile("INFO", formatted);
  }

  /**
   * Log debug
   */
  debug(message, meta = {}) {
    if (this.currentLevel < this.levels.DEBUG) return;
    
    const formatted = this._format("DEBUG", message, meta);
    console.log(formatted);
    this._writeToFile("DEBUG", formatted);
  }

  /**
   * Log trace
   */
  trace(message, meta = {}) {
    if (this.currentLevel < this.levels.TRACE) return;
    
    const formatted = this._format("TRACE", message, meta);
    console.log(formatted);
    this._writeToFile("TRACE", formatted);
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext) {
    const childContext = this.context 
      ? `${this.context}:${additionalContext}`
      : additionalContext;
    return new Logger(childContext);
  }

  /**
   * Log with custom level
   */
  log(level, message, meta = {}) {
    const levelUpper = level.toUpperCase();
    if (this.levels[levelUpper] === undefined) {
      this.error(`Invalid log level: ${level}`);
      return;
    }
    
    if (this.currentLevel < this.levels[levelUpper]) return;
    
    const formatted = this._format(levelUpper, message, meta);
    console.log(formatted);
    this._writeToFile(levelUpper, formatted);
  }

  /**
   * Time a function execution
   */
  async time(label, fn) {
    const start = Date.now();
    this.debug(`Starting: ${label}`);
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.debug(`Completed: ${label}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Failed: ${label}`, { 
        duration: `${duration}ms`,
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = Logger;
