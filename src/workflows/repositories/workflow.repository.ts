import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TriggerType, Prisma } from '@prisma/client';

@Injectable()
export class WorkflowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      name: string;
      trigger: TriggerType;
      isActive?: boolean;
      condition?: Record<string, unknown>;
    },
  ) {
    return this.prisma.workflow.create({
      data: {
        userId,
        name: data.name,
        trigger: data.trigger,
        isActive: data.isActive ?? true,
        // Cast vers Prisma.InputJsonValue pour satisfaire le typage JSON de Prisma
        condition: data.condition as Prisma.InputJsonValue ?? Prisma.DbNull,
      },
      include: { actions: true },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId },
      include: { actions: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndUser(id: string, userId: string) {
    return this.prisma.workflow.findFirst({
      where: { id, userId },
      include: { actions: { orderBy: { order: 'asc' } } },
    });
  }

  async findActiveByTrigger(trigger: TriggerType) {
    return this.prisma.workflow.findMany({
      where: { trigger, isActive: true },
      include: { actions: { orderBy: { order: 'asc' } } },
    });
  }

  async update(
    id: string,
    data: { name?: string; isActive?: boolean; condition?: Record<string, unknown> },
  ) {
    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...data,
        // Cast uniquement si condition est fournie
        condition: data.condition !== undefined
          ? data.condition as Prisma.InputJsonValue
          : undefined,
      },
      include: { actions: { orderBy: { order: 'asc' } } },
    });
  }

  async addAction(
    workflowId: string,
    data: {
      type: string;
      order: number;
      params?: Record<string, unknown>;
    },
  ) {
    return this.prisma.workflowAction.create({
      data: {
        workflowId,
        type: data.type as any,
        order: data.order,
        // Cast vers Prisma.InputJsonValue pour les params JSON
        params: data.params as Prisma.InputJsonValue ?? Prisma.DbNull,
      },
    });
  }

  async removeAction(actionId: string) {
    return this.prisma.workflowAction.delete({ where: { id: actionId } });
  }

  async delete(id: string) {
    return this.prisma.workflow.delete({ where: { id } });
  }
}