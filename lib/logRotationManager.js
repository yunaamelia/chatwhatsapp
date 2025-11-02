/**
 * Log Rotation Manager
 * Handles automatic log rotation with retention policy
 */

const fs = require("fs");
const path = require("path");

class LogRotationManager {
  constructor() {
    this.logsDir = path.join(__dirname, "../logs");
    this.retentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 7;
    this.rotationInterval = null;
  }

  /**
   * Start automatic log rotation
   */
  start() {
    console.log("📋 Log rotation manager started");
    console.log(`   Retention: ${this.retentionDays} days`);

    // Run immediately on start
    this.rotateOldLogs();

    // Run daily at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow - now;

    setTimeout(() => {
      this.rotateOldLogs();
      // Then run every 24 hours
      this.rotationInterval = setInterval(() => {
        this.rotateOldLogs();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    console.log(`   Next rotation: ${tomorrow.toLocaleString("id-ID")}`);
  }

  /**
   * Stop log rotation
   */
  stop() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      console.log("📋 Log rotation manager stopped");
    }
  }

  /**
   * Rotate old logs (delete files older than retention period)
   */
  rotateOldLogs() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        return;
      }

      const now = Date.now();
      const maxAge = this.retentionDays * 24 * 60 * 60 * 1000;
      const files = fs.readdirSync(this.logsDir);

      let deletedCount = 0;
      let totalSize = 0;

      files.forEach((file) => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);

        // Check if file is older than retention period
        const fileAge = now - stats.mtimeMs;
        if (fileAge > maxAge) {
          totalSize += stats.size;
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`🗑️  Deleted old log: ${file}`);
        }
      });

      if (deletedCount > 0) {
        const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
        console.log(
          `✅ Log rotation complete: ${deletedCount} files deleted (${sizeMB} MB freed)`
        );
      } else {
        console.log("✅ Log rotation complete: No old logs to delete");
      }
    } catch (error) {
      console.error("❌ Log rotation error:", error.message);
    }
  }

  /**
   * Get log statistics
   */
  getStats() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        return {
          totalFiles: 0,
          totalSize: 0,
          oldestLog: null,
          newestLog: null,
        };
      }

      const files = fs.readdirSync(this.logsDir);
      let totalSize = 0;
      let oldestTime = Date.now();
      let newestTime = 0;
      let oldestFile = null;
      let newestFile = null;

      files.forEach((file) => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);

        totalSize += stats.size;

        if (stats.mtimeMs < oldestTime) {
          oldestTime = stats.mtimeMs;
          oldestFile = file;
        }

        if (stats.mtimeMs > newestTime) {
          newestTime = stats.mtimeMs;
          newestFile = file;
        }
      });

      return {
        totalFiles: files.length,
        totalSize: (totalSize / 1024 / 1024).toFixed(2) + " MB",
        oldestLog: oldestFile,
        newestLog: newestFile,
        retentionDays: this.retentionDays,
      };
    } catch (error) {
      console.error("❌ Error getting log stats:", error.message);
      return null;
    }
  }

  /**
   * Manually trigger log rotation
   */
  forceRotation() {
    console.log("🔄 Manual log rotation triggered");
    this.rotateOldLogs();
  }
}

// Singleton instance
const logRotationManager = new LogRotationManager();

module.exports = logRotationManager;
