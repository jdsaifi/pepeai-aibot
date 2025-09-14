import config from '../config';
import util from 'util';

type LogLevel = 'log' | 'info' | 'warn' | 'error';

const ENABLE_LOGS = JSON.parse(config?.enable_logs.toString() || 'false');

const customLog = (level: LogLevel, ...args: any[]) => {
    if (ENABLE_LOGS === true) {
        console[level](...args);
    }
};

// Shortcut methods
const log = (...args: any[]) => customLog('log', ...args);
const info = (...args: any[]) => customLog('info', ...args);
const warn = (...args: any[]) => customLog('warn', ...args);
const error = (...args: any[]) => customLog('error', ...args);

export const consoleLog = {
    log,
    info,
    warn,
    error,
};

export const deepLog = (...args: any[]) =>
    customLog('log', util.inspect(args, { depth: null }));
