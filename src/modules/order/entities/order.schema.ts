import mongoose, { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/base/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaProvider } from '../../../providers/model.providers';

export type OrderDocument = HydratedDocument<Order>;

@Schema(BaseSchema)
export class Order {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, unique: true })
  orderId: string;

  @Prop({ type: String, required: true, index: true })
  tranId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: SchemaProvider.TICKET,
    required: true,
  })
  items: mongoose.Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
