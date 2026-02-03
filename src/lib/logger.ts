const noop = (..._args: unknown[]) => {
  void _args;
};

export const logger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop,
};
