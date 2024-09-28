import { createLogger, LogLevel } from "@joyautomation/coral";

export function getLog(name: string, logLevel: LogLevel) {
  return createLogger(name, logLevel);
}
