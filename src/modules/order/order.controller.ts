import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
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
  List() {
    return this.service.getOrder();
  }
}
