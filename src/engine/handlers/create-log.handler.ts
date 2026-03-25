import { Injectable, Logger } from '@nestjs/common';
import { ActionHandler, EventContext } from '../interfaces/action-handler.interface';

@Injectable()
export class CreateLogHandler implements ActionHandler {
  private readonly logger = new Logger(CreateLogHandler.name);

  async execute(context: EventContext): Promise<string> {
    const message = `[LOG CREATED] Context: ${JSON.stringify(context)}`;
    this.logger.log(message);
    return message;
  }
}