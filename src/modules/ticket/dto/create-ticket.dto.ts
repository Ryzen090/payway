import { STATUS } from '../../../common/enums';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTicketDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  floor: number;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsEnum(STATUS)
  status: STATUS;
}
