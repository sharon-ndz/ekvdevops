import { createLogger, transports, format } from 'winston';
import { appConstants } from '../constants/constants';

const errorStackFormat = format((info) => {
  if (info instanceof Error) {
    return { ...info, stack: info.stack, message: info.message };
  }
  return info;
});

const logFormat = format.combine(
  format.timestamp(),
  format.colorize({ all: true }),
  format.prettyPrint(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  errorStackFormat(),
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: appConstants.logTitle },
  format: logFormat,
  transports: [new transports.Console()],
});

const logError = (msg: any, ...args: any[]) => {
  logger.error(msg, ...args);
};

export default {
  ...logger,
  info: (msg: any, ...args: any[]) => logger.info(msg, ...args),
  warn: (msg: any, ...args: any[]) => logger.warn(msg, ...args),
  error: logError,
  debug: (msg: any, ...args: any[]) => logger.debug(msg, ...args),
};
