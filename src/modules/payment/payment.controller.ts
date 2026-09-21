import type { Request } from 'express';
import { AuthUser } from '../../model/auth';
import { AuthGuard } from '@nestjs/passport';
import { PaymentDTO } from './dto/payment.dto';
import { PaymentService } from './payment.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

@UseGuards(AuthGuard('jwt'))
@Controller({
  version: '1',
  path: 'payment',
})
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post()
  payment(@Body() body: PaymentDTO, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.service.payment(body, user);
  }

  @Post('check')
  check(@Body('tran_id') tran_id: string) {
    return this.service.check(tran_id);
  }
}
