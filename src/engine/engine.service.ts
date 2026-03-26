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

  // Listeners d'events (Pattern Observer)

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

  /***
   On log explicitement le trigger déclenché puis on récupère tous les workflows
   actifs pour ce trigger. (Si on a rien, on quitte)
   Pour chaque workflow correspondant, on les exécute en parallèle.
   ***/
  private async processEvent(
    trigger: TriggerType,
    context: actionHandlerInterface.EventContext,
  ) {
    this.logger.log(`Processing event for trigger: ${trigger}`);

    const workflows =
      await this.workflowRepository.findActiveByTrigger(trigger);

    if (workflows.length === 0) {
      this.logger.log(`No active workflows found for trigger: ${trigger}`);
      return;
    }

    await Promise.all(
      workflows.map((workflow) => this.executeWorkflow(workflow, context)),
    );
  }

  /***
   Avant l'exec du workflow, on check les conditions.
   On créé un log des executions en base pour l'observabilité.

   On éxécute les actions du workflow de façon séquentielle (Chain of Responsibility)
     et ce même si on a un échec sur l'une d'entre elles.

   On récupère le handler de l'action en cours (Pattern Strategy), on execute et
     on enregistre en base le resultat

   On retourne un status (SUCCESS ou FAILED) si une erreur d'exec est détectée
   ***/
  private async executeWorkflow(
    workflow: any,
    context: actionHandlerInterface.EventContext,
  ) {
    if (workflow.condition && !this.evaluateCondition(workflow.condition, context)
    ) {
      this.logger.log(`Workflow "${workflow.name}" skipped — condition not met`,);
      return;
    }

    this.logger.log(`Executing workflow: "${workflow.name}" (${workflow.id})`);

    const execution = await this.executionRepository.createExecution(
      workflow.id,
      context,
    );

    let hasError = false;
    for (const action of workflow.actions) {
      try {
        const handler = this.actionHandlerFactory.getHandler(
          action.type as ActionType);

        const output = await handler.execute(context);

        await this.executionRepository.createActionResult({
          executionId: execution.id,
          actionType: action.type,
          order: action.order,
          status: ResultStatus.SUCCESS,
          output,
        });
      } catch (error) {
        hasError = true;
        const errorMessage = error.message
        this.logger.error(`Action ${action.type} failed in workflow "${workflow.name}": ${errorMessage}`);

        await this.executionRepository.createActionResult({
          executionId: execution.id,
          actionType: action.type,
          order: action.order,
          status: ResultStatus.FAILED,
          output: errorMessage,
        });
      }
    }

    const finalStatus = hasError
      ? ExecutionStatus.FAILED
      : ExecutionStatus.SUCCESS;
    await this.executionRepository.completeExecution(execution.id, finalStatus);

    this.logger.log(`Workflow "${workflow.name}" completed with status: ${finalStatus}`);
  }

  /***
   On check que les conditions pour l'event en fonction des infos de son contexte
    sont valides.

   On retourne true ou false en fonction du passage de la validation ou non.
   ***/
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