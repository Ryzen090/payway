import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';

export default class BaseError {
  key: string;
  args?: Record<string, unknown>;

  private constructor(key: string, args?: Record<string, unknown>) {
    this.key = key;
    this.args = args;
  }

  private static Init(key: string, args?: Record<string, unknown>): BaseError {
    return new BaseError(key, args);
  }

  static Unauthorized(
    key: string,
    args?: Record<string, unknown>,
  ): HttpException {
    return new UnauthorizedException(BaseError.Init(key, args));
  }

  static BadRequest(
    key: string,
    args?: Record<string, unknown>,
  ): HttpException {
    return new BadRequestException(BaseError.Init(key, args));
  }

  static NotFound(key: string, args?: Record<string, unknown>): HttpException {
    return new NotFoundException(BaseError.Init(key, args));
  }

  static Forbidden(key: string, args?: Record<string, unknown>): HttpException {
    return new ForbiddenException(BaseError.Init(key, args));
  }

  static RequestTimeout(
    key: string,
    args?: Record<string, unknown>,
  ): HttpException {
    return new RequestTimeoutException(BaseError.Init(key, args));
  }
}
