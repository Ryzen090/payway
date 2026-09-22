import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { AuthUser } from '../../model/auth';
import { PaymentDTO } from './dto/payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PAYMENT_STATUS } from '../../common/enums';
import { OrderDocument } from '../order/entities/order.schema';
import { SchemaProvider } from '../../providers/model.providers';
import { Payment, PaymentDocument } from './entities/payment.schema';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

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
    const tranId = body.tran_id || Date.now().toString();
    const reqTime = Math.floor(Date.now() / 1000).toString();

    await this.paymentModel.create({
      orderId,
      tranId,
      userId: user._id,
      amount: Number(body.amount),
      status: PAYMENT_STATUS.PENDING,
      items: body.items || [],
    });

    await this.orderModel.create({
      orderId,
      tranId,
    });

    const fields = {
      req_time: reqTime,
      merchant_id: this.merchantId,
      tran_id: tranId,
      amount: body.amount,
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

  async check(tranId: string) {
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

    if (remoteStatus === PAYMENT_STATUS.SUCCESS) {
      updatedStatus = PAYMENT_STATUS.SUCCESS;
    } else if (remoteStatus === PAYMENT_STATUS.FAILED) {
      updatedStatus = PAYMENT_STATUS.FAILED;
    }

    const payment = await this.paymentModel.findOneAndUpdate(
      { tranId },
      { $set: { status: updatedStatus } },
      { returnDocument: 'after' },
    );

    // return response;

    return {
      ...response,
      data: {
        ...response?.data,
        payment_status: payment?.status,
      },
    };
  }
}
