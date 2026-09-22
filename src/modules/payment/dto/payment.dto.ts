import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentItemDTO {
  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class PaymentDTO {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDTO)
  items?: PaymentItemDTO[];
}
