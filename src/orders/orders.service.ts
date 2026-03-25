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

    // Émet l'événement métier order.created
    // Le workflow engine écoutera cet événement et déclenchera
    // les workflows dont le trigger est ORDER_CREATED
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
    // Vérifie que la commande appartient bien à l'utilisateur (US11)
    await this.findOne(id, userId);

    const updated = await this.orderRepository.updateStatus(id, dto.status);

    // Émet l'événement order.paid si le statut passe à PAID
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