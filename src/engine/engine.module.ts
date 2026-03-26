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
    WorkflowsModule,
  ],
  providers: [
    EngineService,
    ActionHandlerFactory,
    ExecutionRepository,
    NotifyAdminHandler,
    NotifyUserHandler,
    CreateLogHandler,
    CreateTaskHandler,
    UpdateStatusHandler,
  ],
  exports: [ExecutionRepository],
})
export class EngineModule {}