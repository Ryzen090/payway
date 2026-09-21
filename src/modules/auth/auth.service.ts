import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { AuthUser } from '../../model/auth';
import { LoginResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async googleLogin(user: AuthUser): Promise<LoginResponse> {
    const payload = {
      sub: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,

      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }
}
