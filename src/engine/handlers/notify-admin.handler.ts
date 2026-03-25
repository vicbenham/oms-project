import { Injectable, Logger } from '@nestjs/common';
import { ActionHandler, EventContext } from '../interfaces/action-handler.interface';

@Injectable()
export class NotifyAdminHandler implements ActionHandler {
  // Logger NestJS — identifié par le nom du handler pour la lisibilité des logs
  private readonly logger = new Logger(NotifyAdminHandler.name);

  async execute(context: EventContext): Promise<string> {
    // En production, on enverrait un email ou une notification Slack
    // Ici on log de façon structurée pour la démo
    const message = `[ADMIN NOTIFICATION] Event triggered for user ${context.userId ?? 'unknown'}`;
    this.logger.log(message);
    return message;
  }
}