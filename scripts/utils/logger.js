const LEVELS = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG'
};

function format(level, ...args) {
  const prefix = `[${new Date().toISOString()}] [${LEVELS[level]}]`;
  return [prefix, ...args];
}

export function info(...args) { console.log(...format('info', ...args)); }
export function warn(...args) { console.warn(...format('warn', ...args)); }
export function error(...args) { console.error(...format('error', ...args)); }
export function debug(...args) { if (process.env.DEBUG) console.debug(...format('debug', ...args)); }

export default { info, warn, error, debug };
