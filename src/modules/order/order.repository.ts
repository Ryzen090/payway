import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { OrderDocument } from './entities/order.schema';

import { SchemaProvider } from '../../providers/model.providers';

import { BaseRepository } from '../../common/base/base.repository';

@Injectable()
export class OrderRepository extends BaseRepository<OrderDocument> {
  constructor(
    @InjectModel(SchemaProvider.ORDER)
    private readonly orderModel: Model<OrderDocument>,
  ) {
    super(orderModel);
  }

  async list(userId: string) {
    return this.orderModel
      .find({ userId })
      .populate({
        path: 'item',
        select: '_id name price',
      })
      .sort({
        dateCreated: -1,
      })
      .lean();
  }
}
