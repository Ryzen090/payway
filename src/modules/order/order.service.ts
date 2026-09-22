import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { OrderDocument } from './entities/order.schema';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class OrderService extends BaseService<OrderDocument, OrderRepository> {
  constructor(repository: OrderRepository) {
    super(repository);
  }

  async getOrder() {
    return this.repository.list();
  }
}
