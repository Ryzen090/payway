import { HttpStatus } from '@nestjs/common';

export abstract class Reasonable {
  getValue(): BaseResponse<this> {
    return success(this);
  }
}

export interface BaseResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const Message = {
  success: 'Success',
};

export function success<T>(data: T): BaseResponse<T> {
  return {
    statusCode: HttpStatus.OK,
    message: Message.success,
    data: data,
  };
}
