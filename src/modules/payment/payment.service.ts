import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { AuthUser } from '../../model/auth';
import { PaymentDTO } from './dto/payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PAYMENT_STATUS, STATUS } from '../../common/enums';
import { PaymentDocument } from './entities/payment.schema';
import { OrderDocument } from '../order/entities/order.schema';
import { SchemaProvider } from '../../providers/model.providers';
import { TicketDocument } from '../ticket/entities/ticket.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly merchantId: string;
  private readonly publicKey: string;
  private readonly purchase: string;
  private readonly checkTransaction: string;

  constructor(
    @InjectModel(SchemaProvider.PAYMENT)
    private readonly paymentModel: Model<PaymentDocument>,

    @InjectModel(SchemaProvider.ORDER)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(SchemaProvider.TICKET)
    private readonly ticketModel: Model<TicketDocument>,
  ) {
    const API_URL = process.env.PAYWAY_URL;
    const API_MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID;
    const API_PUBLIC_KEY = process.env.PAYWAY_PUBLIC_KEY;

    this.publicKey = API_PUBLIC_KEY || '';
    this.merchantId = API_MERCHANT_ID || '';

    this.purchase = `${API_URL}/purchase`;
    this.checkTransaction = `${API_URL}/check-transaction-2`;
  }

  async payment(body: PaymentDTO, user: AuthUser) {
    if (!body.items || body.items.length === 0) {
      throw new BadRequestException('Payment items are required');
    }

    const ticketIds = body.items.map((item) => item._id);

    if (new Set(ticketIds).size !== ticketIds.length) {
      throw new BadRequestException('Duplicate ticket items are not allowed');
    }

    const tickets = await this.ticketModel.find({
      _id: { $in: ticketIds },
    });

    if (tickets.length !== ticketIds.length) {
      throw new BadRequestException('One or more tickets were not found');
    }

    const ticketMap = new Map(
      tickets.map((ticket) => [ticket._id.toString(), ticket]),
    );

    const paymentItems = body.items.map((item) => {
      const ticket = ticketMap.get(item._id);

      if (!ticket) {
        throw new BadRequestException(`Ticket ${item._id} not found`);
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new BadRequestException(`Invalid quantity for ${ticket.name}`);
      }

      if (ticket.status !== STATUS.Active) {
        throw new BadRequestException({
          message: 'Ticket is not active',
          ticket: {
            id: ticket._id,
            name: ticket.name,
            capacity: ticket.capacity,
            available: ticket.available,
            requested: quantity,
            status: ticket.status,
          },
        });
      }

      if (ticket.available < quantity) {
        throw new BadRequestException({
          message: `Only ${ticket.available} tickets are available for ${ticket.name}. Please reduce the quantity and try again.`,
          ticket: {
            id: ticket._id,
            name: ticket.name,
            capacity: ticket.capacity,
            available: ticket.available,
            requested: quantity,
          },
        });
      }

      return {
        _id: ticket._id.toString(),
        name: ticket.name,
        quantity,
        price: Number(ticket.price),
      };
    });

    const amount = paymentItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const orderId = `ORD-${Date.now()}`;
    const tranId = Date.now().toString();
    const reqTime = Math.floor(Date.now() / 1000).toString();

    await this.paymentModel.create({
      orderId,
      tranId,
      userId: user._id,
      amount,
      status: PAYMENT_STATUS.PENDING,
      items: paymentItems,
    });

    const orders: {
      orderId: string;
      tranId: string;
      userId: string;
      items: string;
    }[] = [];

    for (const item of paymentItems) {
      for (let i = 0; i < item.quantity; i++) {
        orders.push({
          orderId: `${orderId}-${orders.length + 1}`,
          tranId,
          userId: user._id,
          items: item._id,
        });
      }
    }

    await this.orderModel.insertMany(orders);

    const fields = {
      req_time: reqTime,
      merchant_id: this.merchantId,
      tran_id: tranId,
      amount: amount.toFixed(2),
      items: Buffer.from(JSON.stringify(paymentItems)).toString('base64'),
      shipping: '0',
      firstname: user?.firstName || '',
      lastname: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '012345678',
      currency: 'USD',
    };

    const stringToHash = Object.values(fields).join('');

    const hash = crypto
      .createHmac('sha512', this.publicKey)
      .update(stringToHash)
      .digest('base64');

    const payWay = await fetch(this.purchase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        ...fields,
        hash,
      }),
    });

    const data = await payWay.json();

    if (!payWay.ok) {
      throw new InternalServerErrorException({
        message: 'PayWay request failed',
        data,
      });
    }

    return {
      ...data,
      status: {
        ...data.status,
        orderId,
      },
    };
  }

  async check(tranId: string, user: AuthUser) {
    const userPayment = await this.paymentModel.findOne({
      tranId,
      userId: user._id,
    });

    if (!userPayment) {
      throw new BadRequestException('Payment not found');
    }

    const reqTime = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const stringToHash = `${reqTime}${this.merchantId}${tranId}`;

    const hash = crypto
      .createHmac('sha512', this.publicKey)
      .update(stringToHash)
      .digest('base64');

    const payWay = await fetch(this.checkTransaction, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        req_time: reqTime,
        merchant_id: this.merchantId,
        tran_id: tranId,
        hash,
      }),
    });

    const response = await payWay.json();

    if (!payWay.ok) {
      throw new InternalServerErrorException({
        message: 'PayWay check transaction failed',
        response,
      });
    }

    const remoteStatus = response?.data?.payment_status;
    let updatedStatus: PAYMENT_STATUS = PAYMENT_STATUS.PENDING;

    if (remoteStatus === PAYMENT_STATUS.PENDING) {
      updatedStatus = PAYMENT_STATUS.SUCCESS;
    } else if (
      remoteStatus === PAYMENT_STATUS.FAILED ||
      remoteStatus === 'FAILED'
    ) {
      updatedStatus = PAYMENT_STATUS.FAILED;
    }

    const currentPayment = await this.paymentModel.findOne({ tranId });

    if (
      updatedStatus === PAYMENT_STATUS.SUCCESS &&
      currentPayment &&
      currentPayment.status !== PAYMENT_STATUS.SUCCESS
    ) {
      for (const item of currentPayment.items) {
        const ticket = await this.ticketModel.findOneAndUpdate(
          {
            _id: item._id,
            available: { $gte: item.quantity },
          },
          {
            $inc: {
              available: -item.quantity,
            },
          },
          {
            new: true,
          },
        );

        if (!ticket) {
          throw new BadRequestException(
            `Not enough tickets available for ${item.name}`,
          );
        }

        await this.ticketModel.updateOne(
          {
            _id: item._id,
          },
          {
            $set: {
              status: ticket.available > 0 ? STATUS.Active : STATUS.InActive,
            },
          },
        );
      }
    }

    await this.paymentModel.findOneAndUpdate(
      { tranId },
      { $set: { status: updatedStatus } },
      { returnDocument: 'after' },
    );

    // return response;

    return {
      ...response,
      data: {
        ...response.data,
        payment_status: updatedStatus,
      },
    };
  }
}
