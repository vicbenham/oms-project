import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionHandler } from './interfaces/action-handler.interface';
import { NotifyAdminHandler } from './handlers/notify-admin.handler';
import { NotifyUserHandler } from './handlers/notify-user.handler';
import { CreateLogHandler } from './handlers/create-log.handler';
import { CreateTaskHandler } from './handlers/create-task.handler';
import { UpdateStatusHandler } from './handlers/update-status.handler';

// Pattern Factory — centralise la création des handlers
// Le moteur demande un handler par type d'action sans connaître les implémentations
// Pour ajouter un nouveau type d'action : créer le handler + l'enregistrer ici
@Injectable()
export class ActionHandlerFactory {
  // Map qui associe chaque ActionType à son handler concret
  private readonly handlers: Map<ActionType, ActionHandler>;

  constructor(
    private readonly notifyAdminHandler: NotifyAdminHandler,
    private readonly notifyUserHandler: NotifyUserHandler,
    private readonly createLogHandler: CreateLogHandler,
    private readonly createTaskHandler: CreateTaskHandler,
    private readonly updateStatusHandler: UpdateStatusHandler,
  ) {
    // Enregistrement de tous les handlers disponibles
    this.handlers = new Map<ActionType, ActionHandler>([
      [ActionType.NOTIFY_ADMIN, this.notifyAdminHandler],
      [ActionType.NOTIFY_USER, this.notifyUserHandler],
      [ActionType.CREATE_LOG, this.createLogHandler],
      [ActionType.CREATE_TASK, this.createTaskHandler],
      [ActionType.UPDATE_STATUS, this.updateStatusHandler],
    ]);
  }

  // Retourne le handler correspondant au type d'action
  // Lève une erreur si le type n'est pas enregistré
  getHandler(type: ActionType): ActionHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`No handler registered for action type: ${type}`);
    }
    return handler;
  }
}