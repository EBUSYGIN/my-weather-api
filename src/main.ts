import { ContainerModule, ContainerModuleLoadOptions, Container } from 'inversify';
import { App } from './app';
import { DI_TYPES } from './common/config/DI.types';
import { LogService } from './common/log-service/log.service';
import { ILogService } from './common/log-service/log.service.interface';
import { IEnvService } from './common/env-service/env.service.interface';
import { EnvService } from './common/env-service/env.service';
import { IDatabaseService } from './common/database-service/database-service.interface';
import { DatabaseService } from './common/database-service/database-service';

const appBindings = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<App>(DI_TYPES.App).to(App).inSingletonScope();
  options.bind<ILogService>(DI_TYPES.LogService).to(LogService).inSingletonScope();
  options.bind<IEnvService>(DI_TYPES.EnvService).to(EnvService).inSingletonScope();
  options.bind<IDatabaseService>(DI_TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
});

async function boot(): Promise<void> {
  const appContainer = new Container();
  appContainer.load(appBindings);
  const app = appContainer.get<App>(DI_TYPES.App);
  await app.init();
}

await boot();
