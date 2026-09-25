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
    const orderId = `ORD-${Date.now()}`;
    const tranId = Date.now().toString();
    const reqTime = Math.floor(Date.now() / 1000).toString();

    if (!body.items || body.items.length === 0) {
      throw new BadRequestException('Payment items are required');
    }

    const amount = body.items.reduce((total, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (!Number.isFinite(price) || price <= 0) {
        throw new BadRequestException(`Invalid price for item ${item.name}`);
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new BadRequestException(`Invalid quantity for item ${item.name}`);
      }

      return total + price * quantity;
    }, 0);

    const item = body.items?.[0];
    const ticket = await this.ticketModel.findById(item?._id);

    if (!ticket) {
      throw new BadRequestException(`Ticket not found`);
    }

    const available = ticket?.available || 0;
    const quantity = item?.quantity || 0;

    if (available < quantity) {
      throw new BadRequestException({
        message: `Only ${available} tickets are available for ${item?.name}. Please reduce the quantity and try again.`,
        ticket: {
          id: ticket?._id,
          name: ticket?.name,
          capacity: ticket?.capacity,
          available: ticket?.available,
          requested: quantity,
        },
      });
    }

    await this.paymentModel.create({
      orderId,
      tranId,
      userId: user._id,
      amount,
      status: PAYMENT_STATUS.PENDING,
      items: body.items || [],
    });

    const orders = [];

    for (const item of body.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketOrderId = `${orderId}-${i + 1}`;

        orders.push({
          orderId: ticketOrderId,
          tranId,
          userId: user._id,
        });
      }
    }

    await this.orderModel.insertMany(orders);

    const fields = {
      req_time: reqTime,
      merchant_id: this.merchantId,
      tran_id: tranId,
      amount: amount.toFixed(2),
      items: body.items
        ? Buffer.from(JSON.stringify(body.items)).toString('base64')
        : '',
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
