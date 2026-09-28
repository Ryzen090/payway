import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentItemDTO {
  @IsString()
  _id: string;

  @IsNumber()
  quantity: number;
}

export class PaymentDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDTO)
  items: PaymentItemDTO[];
}
