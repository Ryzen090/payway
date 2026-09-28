import mongoose, { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/base/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaProvider } from '../../../providers/model.providers';
import { ORDER_STATUS } from '../../../common/enums';

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
  item: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({
    type: [
      {
        code: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: [ORDER_STATUS.PENDING, ORDER_STATUS.REDEEMED],
          default: ORDER_STATUS.PENDING,
        },
      },
    ],
    required: true,
  })
  tickets: {
    code: string;
    status: string;
  }[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
