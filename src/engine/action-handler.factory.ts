import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionHandler } from './interfaces/action-handler.interface';
import { NotifyAdminHandler } from './handlers/notify-admin.handler';
import { NotifyUserHandler } from './handlers/notify-user.handler';
import { CreateLogHandler } from './handlers/create-log.handler';
import { CreateTaskHandler } from './handlers/create-task.handler';
import { UpdateStatusHandler } from './handlers/update-status.handler';

/***
 C'est la classe de notre pattern Factory pour centraliser la création de nos handlers.
 On simplifie la création d'un nouveau type d'action en créant le handler et en
  l'enregistrant ici (tout est centralisé).

 Le map associe un type d'action a son handler correspondant, puis on enregistre
  tous les handlers disponibles.
 ***/
@Injectable()
export class ActionHandlerFactory {
  private readonly handlers: Map<ActionType, ActionHandler>;

  constructor(
    private readonly notifyAdminHandler: NotifyAdminHandler,
    private readonly notifyUserHandler: NotifyUserHandler,
    private readonly createLogHandler: CreateLogHandler,
    private readonly createTaskHandler: CreateTaskHandler,
    private readonly updateStatusHandler: UpdateStatusHandler,
  ) {
    this.handlers = new Map<ActionType, ActionHandler>([
      [ActionType.NOTIFY_ADMIN, this.notifyAdminHandler],
      [ActionType.NOTIFY_USER, this.notifyUserHandler],
      [ActionType.CREATE_LOG, this.createLogHandler],
      [ActionType.CREATE_TASK, this.createTaskHandler],
      [ActionType.UPDATE_STATUS, this.updateStatusHandler],
    ]);
  }

  /***
   On retourne le handler qui correspond au type d'action passé.
   Si le handler n'est pas créé, on pète une erreur.
   ***/
  getHandler(type: ActionType): ActionHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`No handler registered for action type: ${type}`);
    }
    return handler;
  }
}