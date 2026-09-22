import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/base/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema(BaseSchema)
export class Order {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, unique: true })
  orderId: string;

  @Prop({ type: String, required: true, index: true })
  tranId: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
