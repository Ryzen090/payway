import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { OrderSchema } from './entities/order.schema';
import { SchemaProvider } from '../../providers/model.providers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchemaProvider.ORDER, schema: OrderSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}
