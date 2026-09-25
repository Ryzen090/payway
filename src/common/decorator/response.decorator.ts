import { UseInterceptors } from '@nestjs/common';
import { GeneralResponse } from '../../model/response.message';
import { TransformInterceptor } from '../middleware/transform.interceptor';

export const Success = (
  message: string = GeneralResponse.Success,
): MethodDecorator & ClassDecorator =>
  UseInterceptors(new TransformInterceptor(200, message));

export const Update = (
  message: string = GeneralResponse.Update,
): MethodDecorator & ClassDecorator =>
  UseInterceptors(new TransformInterceptor(204, message));
