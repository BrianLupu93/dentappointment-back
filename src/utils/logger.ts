import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const transportConsole = new winston.transports.Console({
  format: combine(colorize(), timestamp(), logFormat),
});

const transportFile = new winston.transports.DailyRotateFile({
  dirname: "logs",
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "10m",
  maxFiles: "14d",
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [transportConsole, transportFile],
});
