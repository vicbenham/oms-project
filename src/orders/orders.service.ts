import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderRepository } from './repositories/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.orderRepository.create(userId, dto.amount);

    this.eventEmitter.emit('order.created', {
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
      status: order.status,
    });

    return order;
  }

  async findAll(userId: string) {
    return this.orderRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string) {
    const order = await this.orderRepository.findByIdAndUser(id, userId);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async updateStatus(id: string, userId: string, dto: UpdateOrderStatusDto) {
    await this.findOne(id, userId);

    const updated = await this.orderRepository.updateStatus(id, dto.status);

    if (dto.status === OrderStatus.PAID) {
      this.eventEmitter.emit('order.paid', {
        orderId: updated.id,
        userId: updated.userId,
        amount: updated.amount,
        status: updated.status,
      });
    }

    return updated;
  }
}