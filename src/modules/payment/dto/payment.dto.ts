import { IsEmail, IsOptional, IsString } from 'class-validator';

export class PaymentDTO {
  @IsString()
  tran_id: string;

  @IsString()
  amount: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  phone: string;
}
