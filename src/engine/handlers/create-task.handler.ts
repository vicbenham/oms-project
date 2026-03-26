import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActionHandler, EventContext } from '../interfaces/action-handler.interface';

@Injectable()
export class CreateTaskHandler implements ActionHandler {
  private readonly logger = new Logger(CreateTaskHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(context: EventContext): Promise<string> {
    const task = await this.prisma.task.create({
      data: {
        title: `Task for order ${context.orderId ?? 'unknown'}`,
        description: `Auto-generated task from workflow. Context: ${JSON.stringify(context)}`,
      },
    });

    const message = `[TASK CREATED] Task ${task.id} created for order ${context.orderId ?? 'unknown'}`;
    this.logger.log(message);
    return message;
  }
}