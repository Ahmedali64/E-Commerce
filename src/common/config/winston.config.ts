import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          (info: {
            level: string;
            message: string;
            timestamp: string;
            context?: string;
          }) => {
            const { level, message, timestamp, context } = info;
            return `[${timestamp}] [${level}]${context ? ' [' + context + ']' : ''}: ${message}`;
          },
        ),
      ),
    }),

    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
