import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PAYMENT_STATUS } from '../../common/enums';
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
    return this.orderModel.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $lookup: {
          from: 'payments',
          localField: 'tranId',
          foreignField: 'tranId',
          as: 'payment',
        },
      },
      {
        $unwind: '$payment',
      },
      {
        $match: {
          'payment.status': PAYMENT_STATUS.SUCCESS,
          'payment.userId': userId,
        },
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          tranId: 1,
          status: '$payment.status',
          amount: '$payment.amount',
          items: '$payment.items',
          createdAt: 1,
        },
      },
    ]);
  }
}
