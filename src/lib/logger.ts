const noop = (..._args: unknown[]) => {
  void _args;
};

export const logger = {
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[logger]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[logger]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info('[logger]', ...args);
    }
  },
  debug: noop,
};
