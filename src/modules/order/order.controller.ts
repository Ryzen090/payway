import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { Order } from './entities/order.schema';
import { ListQuery } from '../../common/base/list.query';
import ListResponse from '../../common/base/list.response';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Success } from '../../common/decorator/response.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller({
  version: '1',
  path: 'orders',
})
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get()
  @Success()
  list(@Query() listQuery: ListQuery): Promise<ListResponse<Order>> {
    return this.service.list(listQuery);
  }
}
