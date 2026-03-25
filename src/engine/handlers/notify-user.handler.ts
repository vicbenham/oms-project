import { Injectable, Logger } from '@nestjs/common';
import { ActionHandler, EventContext } from '../interfaces/action-handler.interface';

@Injectable()
export class NotifyUserHandler implements ActionHandler {
  private readonly logger = new Logger(NotifyUserHandler.name);

  async execute(context: EventContext): Promise<string> {
    const message = `[USER NOTIFICATION] Notification sent to user ${context.userId ?? 'unknown'}`;
    this.logger.log(message);
    return message;
  }
}