import { config } from "../config.js";
import { createLogger, format, transports } from "winston";
import path from "path";

let pathOption: (typeof transports.File)[] = [];

// 日志输出目录
if (config.USE_LOG_FILE) {
  pathOption = [
    new transports.File({
      filename: path.resolve("logs/error.log"),
      level: "error",
      maxsize: 1024 * 1024,
      maxFiles: 1,
    }),
    new transports.File({
      filename: path.resolve("logs/logger.log"),
      maxsize: 1024 * 1024,
      maxFiles: 1,
    }),
  ];
}

// logger
const logger = createLogger({
  // 最低的日志级别
  level: "info",
  // 定义日志的格式
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: pathOption,
});

// 控制台输出
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

export default logger;
