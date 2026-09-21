import { HydratedDocument } from 'mongoose';
import { STATUS } from '../../../common/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from '../../../common/base/base.schema';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema(BaseSchema)
export class Ticket {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  floor: number;

  @Prop({ type: Number, required: true })
  capacity: number;

  @Prop({ type: Number, required: true })
  available: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, enum: STATUS, default: STATUS.InActive })
  status: STATUS;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
