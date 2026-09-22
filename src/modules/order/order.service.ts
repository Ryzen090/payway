import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { OrderDocument } from './entities/order.schema';
import { ListQuery } from '../../common/base/list.query';
import ListResponse from '../../common/base/list.response';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class OrderService extends BaseService<OrderDocument, OrderRepository> {
  constructor(repository: OrderRepository) {
    super(repository);
  }

  list(listQuery: ListQuery): Promise<ListResponse<OrderDocument>> {
    return this.repository.getList(listQuery, {});
  }
}
