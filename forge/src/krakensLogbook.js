const fs = require('fs');
  const path = require('path');
  const { EventEmitter } = require('events');

  class KrakensLogbook extends EventEmitter {
    constructor() {
      super();
      this.logDirectory = path.join(__dirname, '../logs');
      this.ensureLogDirectoryExists();
    }

    ensureLogDirectoryExists() {
      if (!fs.existsSync(this.logDirectory)) {
        fs.mkdirSync(this.logDirectory, { recursive: true });
      }
    }

    // Pirate-themed error severity levels
    static SEVERITY = {
      CALM_SEAS: 0,     // Informational
      LIGHT_STORM: 1,   // Warning
      HURRICANE: 2,     // Error
      KRAKEN_ATTACK: 3  // Critical
    };

    // Humorous error messages based on severity
    getHumorousMessage(severity) {
      const messages = {
        [KrakensLogbook.SEVERITY.CALM_SEAS]: [
          "Smooth sailing, matey!",
          "Winds be gentle today!",
          "All systems shipshape!"
        ],
        [KrakensLogbook.SEVERITY.LIGHT_STORM]: [
          "Careful now, rough waters ahead!",
          "Might want to batten down the hatches!",
          "Small leak in the hull, but nothing serious!"
        ],
        [KrakensLogbook.SEVERITY.HURRICANE]: [
          "Arrr, we've hit a nasty squall!",
          "Mayday! Systems be struggling!",
          "Prepare for rough seas, crew!"
        ],
        [KrakensLogbook.SEVERITY.KRAKEN_ATTACK]: [
          "ABANDON SHIP! KRAKEN INCOMING!",
          "TOTAL SYSTEM MELTDOWN!",
          "WE'RE DOOMED! (Maybe...)"
        ]
      };

      return messages[severity][Math.floor(Math.random() * messages[severity].length)];
    }

    logError(details) {
      const logEntry = {
        id: this.generateLogId(),
        timestamp: new Date(),
        projectId: details.projectId || 'unknown',
        component: details.component || 'system',
        severity: details.severity || KrakensLogbook.SEVERITY.LIGHT_STORM,
        message: details.message,
        humorousMessage: this.getHumorousMessage(details.severity),
        stackTrace: details.stackTrace,
        context: details.context || {}
      };

      // Write to log file
      const logFilePath = path.join(
        this.logDirectory, 
        `${logEntry.timestamp.toISOString().split('T')[0]}_kraken_log.json`
      );

      // Append to log file
      this.appendToLogFile(logFilePath, logEntry);

      // Emit error event
      this.emit('error_logged', logEntry);

      return logEntry;
    }

    appendToLogFile(filePath, logEntry) {
      let logs = [];
      
      // Read existing logs if file exists
      if (fs.existsSync(filePath)) {
        try {
          logs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (readError) {
          console.error('Failed to read existing log file', readError);
        }
      }

      // Add new log entry
      logs.push(logEntry);

      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));

      return logEntry;
    }

    // Error Recovery Mechanisms
    generateRecoveryPlan(error) {
      const recoveryStrategies = {
        'dependency_missing': [
          "Check yer project's treasure map (dependencies)",
          "Fetch the missing booty (library) from the package manager",
          "Restart yer vessel (application)"
        ],
        'connection_error': [
          "Check the communication lines (network)",
          "Verify the signal flags (server status)",
          "Try casting yer message in a bottle again (retry connection)"
        ],
        'configuration_error': [
          "Inspect the ship's blueprints (configuration files)",
          "Consult the ship's navigator (check settings)",
          "Realign the compass (reconfigure)"
        ]
      };

      return {
        type: error.type || 'unknown',
        strategies: recoveryStrategies[error.type] || [
          "Consult the ship's wizard (developer)",
          "Perform a ritual dance (debug)",
          "Pray to the code gods"
        ]
      };
    }

    generateLogId() {
      return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  module.exports = new KrakensLogbook();
