// src/workflows/workflows.module.ts
import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowRepository } from './repositories/workflow.repository';

@Module({
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowRepository],
  exports: [WorkflowRepository],
})
export class WorkflowsModule {}