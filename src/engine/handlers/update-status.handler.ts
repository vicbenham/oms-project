import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActionHandler, EventContext } from '../interfaces/action-handler.interface';

@Injectable()
export class UpdateStatusHandler implements ActionHandler {
  private readonly logger = new Logger(UpdateStatusHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(context: EventContext): Promise<string> {
    if (!context.orderId) {
      return '[UPDATE STATUS] Skipped — no orderId in context';
    }

    await this.prisma.order.update({
      where: { id: context.orderId },
      data: { status: 'PAID' },
    });

    const message = `[STATUS UPDATED] Order ${context.orderId} status updated`;
    this.logger.log(message);
    return message;
  }
}