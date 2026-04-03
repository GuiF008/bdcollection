const PREFIX = "[scraping]";

export const scrapeLog = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (meta && Object.keys(meta).length > 0) {
      console.info(PREFIX, msg, meta);
    } else {
      console.info(PREFIX, msg);
    }
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(PREFIX, msg, meta ?? "");
  },
  error: (msg: string, err?: unknown) => {
    console.error(PREFIX, msg, err);
  },
};
