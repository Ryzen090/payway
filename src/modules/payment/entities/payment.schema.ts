import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PAYMENT_STATUS } from '../../../common/enums';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ _id: false })
export class PaymentItem {
  @Prop({ required: true })
  zoneId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

@Schema({
  timestamps: true,
  collection: 'payments',
})
export class Payment {
  @Prop({ required: true, unique: true, index: true })
  orderId: string;

  @Prop({ required: true, unique: true, index: true })
  tranId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.PENDING,
  })
  status: PAYMENT_STATUS;

  @Prop({ type: [PaymentItem], default: [] })
  items: PaymentItem[];
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
