import { Injectable, Logger } from '@nestjs/common';
import { ActionHandler, EventContext } from '../interfaces/action-handler.interface';

@Injectable()
export class NotifyAdminHandler implements ActionHandler {
  private readonly logger = new Logger(NotifyAdminHandler.name);

  async execute(context: EventContext): Promise<string> {
    // On simule avec un log mais on aurait pu faire aussi un nodemailer
    const message = `[ADMIN NOTIFICATION] Event triggered for user ${context.userId ?? 'unknown'}`;
    this.logger.log(message);
    return message;
  }
}