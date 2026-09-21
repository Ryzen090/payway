import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [ConfigModule, PassportModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

