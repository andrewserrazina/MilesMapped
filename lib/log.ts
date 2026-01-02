const isProduction = process.env.NODE_ENV === "production";

type LogArgs = readonly unknown[];

export const logInfo = (...args: LogArgs) => {
  if (!isProduction) {
    console.log(...args);
  }
};

export const logWarn = (...args: LogArgs) => {
  console.warn(...args);
};

export const logError = (...args: LogArgs) => {
  console.error(...args);
};
