import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentSchema } from './entities/payment.schema';
import { OrderSchema } from '../order/entities/order.schema';
import { SchemaProvider } from '../../providers/model.providers';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: SchemaProvider.PAYMENT, schema: PaymentSchema },
      { name: SchemaProvider.ORDER, schema: OrderSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
