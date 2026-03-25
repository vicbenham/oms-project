import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowRepository } from './repositories/workflow.repository';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { AddActionDto } from './dto/add-action.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateWorkflowDto) {
    return this.workflowRepository.create(userId, {
      name: dto.name,
      trigger: dto.trigger,
      isActive: dto.isActive,
      condition: dto.condition,
    });
  }

  async findAll(userId: string) {
    return this.workflowRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string) {
    const workflow = await this.workflowRepository.findByIdAndUser(id, userId);
    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }
    return workflow;
  }

  async update(id: string, userId: string, dto: UpdateWorkflowDto) {
    await this.findOne(id, userId);
    return this.workflowRepository.update(id, dto);
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.workflowRepository.delete(id);
  }

  async addAction(workflowId: string, userId: string, dto: AddActionDto) {
    await this.findOne(workflowId, userId);
    return this.workflowRepository.addAction(workflowId, {
      type: dto.type,
      order: dto.order,
      params: dto.params,
    });
  }

  async removeAction(workflowId: string, actionId: string, userId: string) {
    await this.findOne(workflowId, userId);
    return this.workflowRepository.removeAction(actionId);
  }

  // Déclenche manuellement un workflow (US06 — manual.trigger)
  async triggerManually(workflowId: string, userId: string) {
    const workflow = await this.findOne(workflowId, userId);
    this.eventEmitter.emit('manual.trigger', {
      workflowId: workflow.id,
      userId,
    });
    return { message: `Workflow "${workflow.name}" triggered manually` };
  }
}