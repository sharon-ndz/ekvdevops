import { NextFunction, Response, Request } from 'express';

export type LoggerMiddlewareOptions = {
  log?: (msg: string, ...args: any[]) => void;
};

export function requestLogger(options: LoggerMiddlewareOptions = {}) {
  const { log = console.log } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const now = new Date().toISOString();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const elapsed = seconds * 1000 + nanoseconds / 1e6;
      const { method, originalUrl } = req;
      const { statusCode } = res;
      log(`${method} ${originalUrl} ${statusCode} ${elapsed}ms`, {
        timestamp: now,
        responseTimeMs: elapsed,
        method,
        originalUrl,
        statusCode,
      });
    });

    next();
  };
}
