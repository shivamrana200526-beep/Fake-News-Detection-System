export const logger = {
  info: (msg, ...args) => console.log(msg, ...args),
  error: (msg, ...args) => console.error(msg, ...args),
  warn: (msg, ...args) => console.warn(msg, ...args),
};
