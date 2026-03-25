import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExecutionStatus, ResultStatus, ActionType, Prisma } from '@prisma/client';
import { EventContext } from '../interfaces/action-handler.interface';

@Injectable()
export class ExecutionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createExecution(workflowId: string, context: EventContext) {
    return this.prisma.workflowExecution.create({
      data: {
        workflowId,
        status: ExecutionStatus.RUNNING,
        context: context as Prisma.InputJsonValue,
      },
    });
  }

  async completeExecution(id: string, status: ExecutionStatus) {
    return this.prisma.workflowExecution.update({
      where: { id },
      data: { status, finishedAt: new Date() },
    });
  }

  async createActionResult(data: {
    executionId: string;
    actionType: ActionType;
    order: number;
    status: ResultStatus;
    output: string;
  }) {
    return this.prisma.actionResult.create({ data });
  }

  async findByWorkflow(workflowId: string) {
    return this.prisma.workflowExecution.findMany({
      where: { workflowId },
      include: { actionResults: { orderBy: { order: 'asc' } } },
      orderBy: { startedAt: 'desc' },
    });
  }
}