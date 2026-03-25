import { Module } from '@nestjs/common';
import { EngineService } from './engine.service';
import { ActionHandlerFactory } from './action-handler.factory';
import { ExecutionRepository } from './repositories/execution.repository';
import { NotifyAdminHandler } from './handlers/notify-admin.handler';
import { NotifyUserHandler } from './handlers/notify-user.handler';
import { CreateLogHandler } from './handlers/create-log.handler';
import { CreateTaskHandler } from './handlers/create-task.handler';
import { UpdateStatusHandler } from './handlers/update-status.handler';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    // On importe WorkflowsModule pour accéder au WorkflowRepository
    WorkflowsModule,
  ],
  providers: [
    EngineService,
    ActionHandlerFactory,
    ExecutionRepository,
    // Tous les handlers sont déclarés comme providers
    // NestJS les injectera automatiquement dans la Factory
    NotifyAdminHandler,
    NotifyUserHandler,
    CreateLogHandler,
    CreateTaskHandler,
    UpdateStatusHandler,
  ],
})
export class EngineModule {}