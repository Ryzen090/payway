import { BadRequestException, Injectable } from '@nestjs/common';

import { OrderRepository } from './order.repository';

import { OrderDocument } from './entities/order.schema';

import { BaseService } from '../../common/base/base.service';

@Injectable()
export class OrderService extends BaseService<OrderDocument, OrderRepository> {
  constructor(repository: OrderRepository) {
    super(repository);
  }

  async getOrder(userId: string) {
    return this.repository.list(userId);
  }

  async scan(code: string) {
    if (!code?.trim()) {
      throw new BadRequestException('Ticket QR code is required');
    }

    return this.repository.redeem(code.trim());
  }

  async multiple(orderId: string) {
    if (!orderId?.trim()) {
      throw new BadRequestException('Order ID is required');
    }

    return this.repository.multipleScan(orderId.trim());
  }
}
