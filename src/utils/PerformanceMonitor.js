/**
 * Performance Monitor
 * Tracks and logs performance metrics for optimization
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map(); // metric name -> array of measurements
    this.timers = new Map(); // timer id -> start time
    this.enabled = process.env.ENABLE_PERFORMANCE_MONITORING === "true";
  }

  /**
   * Start a timer
   * @param {string} label - Unique label for this measurement
   * @returns {string} Timer ID
   */
  start(label) {
    if (!this.enabled) return null;

    const timerId = `${label}-${Date.now()}-${Math.random()}`;
    this.timers.set(timerId, {
      label,
      startTime: Date.now(),
      startMemory: process.memoryUsage().heapUsed,
    });
    return timerId;
  }

  /**
   * End a timer and record the measurement
   * @param {string} timerId - Timer ID from start()
   * @returns {number} Duration in milliseconds
   */
  end(timerId) {
    if (!this.enabled || !timerId) return 0;

    const timer = this.timers.get(timerId);
    if (!timer) {
      console.warn(`[PerformanceMonitor] Timer not found: ${timerId}`);
      return 0;
    }

    const duration = Date.now() - timer.startTime;
    const memoryDelta = process.memoryUsage().heapUsed - timer.startMemory;

    // Record measurement
    if (!this.metrics.has(timer.label)) {
      this.metrics.set(timer.label, []);
    }

    this.metrics.get(timer.label).push({
      duration,
      memoryDelta,
      timestamp: Date.now(),
    });

    // Cleanup
    this.timers.delete(timerId);

    // Log if duration is significant
    if (duration > 1000) {
      console.warn(
        `[Performance] ${timer.label} took ${duration}ms (memory: ${this._formatBytes(memoryDelta)})`
      );
    }

    return duration;
  }

  /**
   * Measure execution time of an async function
   * @param {string} label - Label for this measurement
   * @param {Function} fn - Async function to measure
   * @returns {Promise<*>} Function result
   */
  async measure(label, fn) {
    if (!this.enabled) {
      return await fn();
    }

    const timerId = this.start(label);
    try {
      const result = await fn();
      this.end(timerId);
      return result;
    } catch (error) {
      this.end(timerId);
      throw error;
    }
  }

  /**
   * Get statistics for a metric
   * @param {string} label
   * @returns {Object|null}
   */
  getStats(label) {
    if (!this.metrics.has(label)) {
      return null;
    }

    const measurements = this.metrics.get(label);
    if (measurements.length === 0) {
      return null;
    }

    const durations = measurements.map((m) => m.duration);
    const memoryDeltas = measurements.map((m) => m.memoryDelta);

    return {
      count: measurements.length,
      duration: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        total: durations.reduce((a, b) => a + b, 0),
      },
      memory: {
        min: Math.min(...memoryDeltas),
        max: Math.max(...memoryDeltas),
        avg: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
      },
    };
  }

  /**
   * Get all metrics
   * @returns {Object}
   */
  getAllStats() {
    const stats = {};
    for (const label of this.metrics.keys()) {
      stats[label] = this.getStats(label);
    }
    return stats;
  }

  /**
   * Generate performance report
   * @returns {string}
   */
  generateReport() {
    if (!this.enabled) {
      return "Performance monitoring is disabled. Set ENABLE_PERFORMANCE_MONITORING=true to enable.";
    }

    const stats = this.getAllStats();
    const labels = Object.keys(stats).sort((a, b) => {
      return stats[b].duration.total - stats[a].duration.total;
    });

    if (labels.length === 0) {
      return "No performance data available.";
    }

    let report = "📊 *PERFORMANCE REPORT*\n\n";

    for (const label of labels) {
      const stat = stats[label];
      report += `*${label}*\n`;
      report += `• Calls: ${stat.count}\n`;
      report += `• Avg: ${stat.duration.avg.toFixed(2)}ms\n`;
      report += `• Min: ${stat.duration.min}ms\n`;
      report += `• Max: ${stat.duration.max}ms\n`;
      report += `• Total: ${stat.duration.total}ms\n`;
      report += `• Memory: ${this._formatBytes(stat.memory.avg)} avg\n\n`;
    }

    // System memory usage
    const memUsage = process.memoryUsage();
    report += "*System Memory*\n";
    report += `• Heap Used: ${this._formatBytes(memUsage.heapUsed)}\n`;
    report += `• Heap Total: ${this._formatBytes(memUsage.heapTotal)}\n`;
    report += `• RSS: ${this._formatBytes(memUsage.rss)}\n`;

    return report;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Clear old measurements (keep last N measurements per metric)
   * @param {number} keepLast - Number of measurements to keep
   */
  cleanup(keepLast = 100) {
    for (const [label, measurements] of this.metrics.entries()) {
      if (measurements.length > keepLast) {
        const keep = measurements.slice(-keepLast);
        this.metrics.set(label, keep);
      }
    }
  }

  /**
   * Format bytes to human readable
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(Math.abs(bytes)) / Math.log(k)), sizes.length - 1);
    const sign = bytes < 0 ? "-" : "";
    return sign + parseFloat((Math.abs(bytes) / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Get current memory usage
   * @returns {Object}
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: this._formatBytes(usage.heapUsed),
      heapTotal: this._formatBytes(usage.heapTotal),
      rss: this._formatBytes(usage.rss),
      external: this._formatBytes(usage.external),
    };
  }

  /**
   * Log current memory usage
   */
  logMemoryUsage() {
    const usage = this.getMemoryUsage();
    console.log(`[Memory] Heap: ${usage.heapUsed}/${usage.heapTotal} | RSS: ${usage.rss}`);
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
