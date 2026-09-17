import * as crypto from 'crypto';
import { PaymentDTO } from './dto/payment.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly merchantId: string;
  private readonly publicKey: string;
  private readonly purchase: string;
  private readonly checkTransaction: string;
  private readonly returnUrl: string;

  constructor() {
    const API_URL = process.env.PAYWAY_URL;
    const API_MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID;
    const API_PUBLIC_KEY = process.env.PAYWAY_PUBLIC_KEY;
    const API_RETURN_URL = process.env.PAYWAY_RETURN_URL;

    this.publicKey = API_PUBLIC_KEY || '';
    this.returnUrl = API_RETURN_URL || '';
    this.merchantId = API_MERCHANT_ID || '';

    this.purchase = `${API_URL}/purchase`;
    this.checkTransaction = `${API_URL}/check-transaction-2`;
  }

  async payment(body: PaymentDTO) {
    const reqTime = Math.floor(Date.now() / 1000).toString();

    const fields = {
      req_time: reqTime,
      merchant_id: this.merchantId,
      tran_id: body.tran_id,
      amount: body.amount,
      items: '',
      shipping: '0',
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email || '',
      phone: body.phone,
      type: '',
      payment_option: '',
      return_url: this.returnUrl,
      cancel_url: '',
      continue_success_url: '',
      return_deeplink: '',
      currency: 'USD',
      custom_fields: '',
      return_params: '',
      payout: '',
      lifetime: '30',
      additional_params: '',
      google_pay_token: '',
      skip_success_page: '0',
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
      tran_id: body.tran_id,
    };
  }

  async check(_id: string) {
    const reqTime = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const stringToHash = `${reqTime}${this.merchantId}${_id}`;

    const hash = crypto
      .createHmac('sha512', this.publicKey)
      .update(stringToHash)
      .digest('base64');

    const paywayRes = await fetch(this.checkTransaction, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        req_time: reqTime,
        merchant_id: this.merchantId,
        tran_id: _id,
        hash,
      }),
    });

    const data = await paywayRes.json();

    if (!paywayRes.ok) {
      throw new InternalServerErrorException({
        message: 'PayWay check transaction failed',
        data,
      });
    }

    return data;
  }
}
