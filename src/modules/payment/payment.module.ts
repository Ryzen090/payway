import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentSchema } from './entities/payment.schema';
import { OrderSchema } from '../order/entities/order.schema';
import { SchemaProvider } from '../../providers/model.providers';
import { TicketSchema } from '../ticket/entities/ticket.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: SchemaProvider.PAYMENT, schema: PaymentSchema },
      { name: SchemaProvider.ORDER, schema: OrderSchema },
      { name: SchemaProvider.TICKET, schema: TicketSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
