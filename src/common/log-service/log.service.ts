import { injectable } from 'inversify';
import { Logger, ILogObj } from 'tslog';
import { ILogService } from './log.service.interface';

@injectable()
export class LogService implements ILogService {
  private logger: Logger<ILogObj>;

  constructor() {
    const loggerDateTemplate = '{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}} {{logLevelName}}: ';
    this.logger = new Logger({
      prettyLogTemplate: loggerDateTemplate,
    });
  }

  log = (...args: unknown[]): void => {
    this.logger.info(...args);
  };

  error = (...args: unknown[]): void => {
    this.logger.error(...args);
  };

  warn = (...args: unknown[]): void => {
    this.logger.warn(...args);
  };

  debug = (...args: unknown[]): void => {
    this.logger.debug(args);
  };
}
