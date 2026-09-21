import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { TicketModule } from './ticket/ticket.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [PaymentModule, AuthModule, TicketModule, OrderModule],
})
export class ComponentModule {}
