import { PaymentDTO } from './dto/payment.dto';
import { PaymentService } from './payment.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller({
  version: '1',
  path: 'payment',
})
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post()
  payment(@Body() body: PaymentDTO) {
    return this.service.payment(body);
  }

  @Post('check')
  check(@Body('tran_id') tran_id: string) {
    return this.service.check(tran_id);
  }
}
