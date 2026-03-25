import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ActionType,
  ExecutionStatus,
  ResultStatus,
  TriggerType,
} from '@prisma/client';
import { WorkflowRepository } from '../workflows/repositories/workflow.repository';
import { ExecutionRepository } from './repositories/execution.repository';
import { ActionHandlerFactory } from './action-handler.factory';
import * as actionHandlerInterface from './interfaces/action-handler.interface';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly executionRepository: ExecutionRepository,
    private readonly actionHandlerFactory: ActionHandlerFactory,
  ) {}

  // ─── Listeners d'événements (Pattern Observer) ───────────────────────────

  @OnEvent('user.registered')
  async onUserRegistered(context: actionHandlerInterface.EventContext) {
    await this.processEvent(TriggerType.USER_REGISTERED, context);
  }

  @OnEvent('order.created')
  async onOrderCreated(context: actionHandlerInterface.EventContext) {
    await this.processEvent(TriggerType.ORDER_CREATED, context);
  }

  @OnEvent('order.paid')
  async onOrderPaid(context: actionHandlerInterface.EventContext) {
    await this.processEvent(TriggerType.ORDER_PAID, context);
  }

  @OnEvent('manual.trigger')
  async onManualTrigger(context: actionHandlerInterface.EventContext) {
    await this.processEvent(TriggerType.MANUAL, context);
  }

  // ─── Logique principale du moteur ────────────────────────────────────────

  private async processEvent(
    trigger: TriggerType,
    context: actionHandlerInterface.EventContext,
  ) {
    this.logger.log(`Processing event for trigger: ${trigger}`);

    // 1. Récupère tous les workflows actifs pour ce trigger
    const workflows =
      await this.workflowRepository.findActiveByTrigger(trigger);

    if (workflows.length === 0) {
      this.logger.log(`No active workflows found for trigger: ${trigger}`);
      return;
    }

    // 2. Exécute chaque workflow correspondant en parallèle
    await Promise.all(
      workflows.map((workflow) => this.executeWorkflow(workflow, context)),
    );
  }

  private async executeWorkflow(
    workflow: any,
    context: actionHandlerInterface.EventContext,
  ) {
    // US15 — Évalue la condition avant d'exécuter le workflow
    if (
      workflow.condition &&
      !this.evaluateCondition(workflow.condition, context)
    ) {
      this.logger.log(
        `Workflow "${workflow.name}" skipped — condition not met`,
      );
      return;
    }

    this.logger.log(`Executing workflow: "${workflow.name}" (${workflow.id})`);

    // Crée l'enregistrement d'exécution en base (observabilité US12)
    const execution = await this.executionRepository.createExecution(
      workflow.id,
      context,
    );

    let hasError = false;

    // Pattern Chain of Responsibility — exécution séquentielle des actions
    // Chaque action est exécutée dans l'ordre défini, même si une échoue
    for (const action of workflow.actions) {
      try {
        const handler = this.actionHandlerFactory.getHandler(
          action.type as ActionType,
        );

        const output = await handler.execute(context);

        // Enregistre le résultat de l'action (succès)
        await this.executionRepository.createActionResult({
          executionId: execution.id,
          actionType: action.type,
          order: action.order,
          status: ResultStatus.SUCCESS,
          output,
        });
      } catch (error) {
        hasError = true;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        this.logger.error(
          `Action ${action.type} failed in workflow "${workflow.name}": ${errorMessage}`,
        );

        // Enregistre le résultat de l'action (échec)
        await this.executionRepository.createActionResult({
          executionId: execution.id,
          actionType: action.type,
          order: action.order,
          status: ResultStatus.FAILED,
          output: errorMessage,
        });
      }
    }

    // Finalise l'exécution avec le statut global
    const finalStatus = hasError
      ? ExecutionStatus.FAILED
      : ExecutionStatus.SUCCESS;
    await this.executionRepository.completeExecution(execution.id, finalStatus);

    this.logger.log(
      `Workflow "${workflow.name}" completed with status: ${finalStatus}`,
    );
  }

  // US15 — Évalue une condition simple sur le contexte de l'événement
  // Format attendu: { field: "amount", operator: ">", value: 100 }
  private evaluateCondition(
    condition: Record<string, unknown>,
    context: actionHandlerInterface.EventContext,
  ): boolean {
    const { field, operator, value } = condition as {
      field: string;
      operator: string;
      value: unknown;
    };

    const contextValue = context[field];

    switch (operator) {
      case '>':
        return Number(contextValue) > Number(value);
      case '<':
        return Number(contextValue) < Number(value);
      case '>=':
        return Number(contextValue) >= Number(value);
      case '<=':
        return Number(contextValue) <= Number(value);
      case '===':
        return contextValue === value;
      case '!==':
        return contextValue !== value;
      default:
        this.logger.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }
}