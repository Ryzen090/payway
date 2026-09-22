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

  async list() {
    return this.orderModel.aggregate([
      {
        $lookup: {
          from: 'payments',
          localField: 'tranId',
          foreignField: 'tranId',
          as: 'paymentDetails',
        },
      },
      {
        $unwind: '$paymentDetails',
      },
      {
        $match: {
          'paymentDetails.status': PAYMENT_STATUS.SUCCESS,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          tranId: 1,
          status: '$paymentDetails.status',
          amount: '$paymentDetails.amount',
          items: '$paymentDetails.items',
          createdAt: 1,
        },
      },
    ]);
  }
}
