import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import { OrderDocument } from './entities/order.schema';

import { SchemaProvider } from '../../providers/model.providers';

import { ORDER_STATUS } from '../../common/enums';
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

  async redeem(code: string) {
    const order = await this.orderModel.findOneAndUpdate(
      {
        tickets: {
          $elemMatch: {
            code,
            status: ORDER_STATUS.PENDING,
          },
        },
      },
      {
        $set: {
          'tickets.$.status': ORDER_STATUS.REDEEMED,
        },
      },
      {
        new: true,
      },
    );

    if (order) {
      const ticket = order.tickets.find((item) => item.code === code);

      return {
        success: true,
        message: 'Ticket authorized',
        mode: 'single',

        orderId: order.orderId,
        tranId: order.tranId,

        ticketCode: code,

        quantity: 1,

        amount: order.amount / order.quantity,

        status: ticket?.status,

        item: order.item,
      };
    }

    const existingOrder = await this.orderModel.findOne({
      'tickets.code': code,
    });

    if (!existingOrder) {
      throw new BadRequestException('Invalid ticket QR code');
    }

    const ticket = existingOrder.tickets.find((item) => item.code === code);

    if (ticket?.status === ORDER_STATUS.REDEEMED) {
      throw new BadRequestException('Ticket has already been redeemed');
    }

    throw new BadRequestException('Ticket cannot be redeemed');
  }

  async multipleScan(orderId: string) {
    const order = await this.orderModel.findOne({
      orderId,
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const pendingTickets = order.tickets.filter(
      (ticket) => ticket.status === ORDER_STATUS.PENDING,
    );

    if (pendingTickets.length === 0) {
      throw new BadRequestException(
        'All tickets in this order have already been redeemed',
      );
    }

    const pendingCodes = pendingTickets.map((ticket) => ticket.code);

    const result = await this.orderModel.updateOne(
      {
        _id: order._id,
        tickets: {
          $elemMatch: {
            status: ORDER_STATUS.PENDING,
          },
        },
      },
      {
        $set: {
          'tickets.$[ticket].status': ORDER_STATUS.REDEEMED,
        },
      },
      {
        arrayFilters: [
          {
            'ticket.status': ORDER_STATUS.PENDING,
          },
        ],
      },
    );

    if (result.modifiedCount === 0) {
      throw new BadRequestException('Unable to redeem tickets');
    }

    return {
      success: true,
      message: 'Tickets authorized',
      mode: 'multiple',

      orderId: order.orderId,
      tranId: order.tranId,

      quantity: pendingTickets.length,

      ticketCodes: pendingCodes,

      amount: (order.amount / order.quantity) * pendingTickets.length,

      status: ORDER_STATUS.REDEEMED,

      item: order.item,
    };
  }
}
