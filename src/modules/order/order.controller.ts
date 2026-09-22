import type { Request } from 'express';
import { AuthUser } from '../../model/auth';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
  list(@Req() req: Request) {
    const user = req.user as AuthUser;

    return this.service.getOrder(user._id);
  }
}
