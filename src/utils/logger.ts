// utils/logger.ts
import winston from 'winston';
import util from 'util';

const { combine, timestamp, errors, colorize } = winston.format;

// Safely stringify anything
const formatMessage = (info: any) => {
    if (typeof info.message === 'object') {
        info.message = util.inspect(info.message, {
            depth: null,
            colors: false,
        });
    }
    if (info.stack) {
        info.message = info.stack;
    }
    return info;
};

const customFormat = winston.format(formatMessage)();

const logger = winston.createLogger({
    level: 'debug',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), customFormat),
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

export { logger as Logger };
