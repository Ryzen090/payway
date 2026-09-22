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
          'payment.userId': userId,
          'payment.status': PAYMENT_STATUS.SUCCESS,
        },
      },
      {
        $unwind: '$payment.items',
      },
      {
        $group: {
          _id: '$payment.items._id',

          name: {
            $first: '$payment.items.name',
          },

          price: {
            $first: '$payment.items.price',
          },

          quantity: {
            $sum: '$payment.items.quantity',
          },

          totalAmount: {
            $sum: {
              $multiply: ['$payment.items.quantity', '$payment.items.price'],
            },
          },

          orderIds: {
            $push: '$orderId',
          },

          tranIds: {
            $push: '$tranId',
          },

          orderCount: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          quantity: 1,
          totalAmount: 1,
          orderIds: 1,
          tranIds: 1,
          orderCount: 1,
        },
      },
    ]);
  }
}
