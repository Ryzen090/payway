import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';

import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { AuthUser } from '../../model/auth';
import APIResponse from '../../model/response';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as AuthUser;

    const result = await this.authService.googleLogin(user);

    const end = process.env.FRONTEND_URL;

    return res.redirect(
      `${end}/auth/callback?token=${encodeURIComponent(result.access_token)}`,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: Request) {
    return new APIResponse<AuthUser>(true, req.user as AuthUser);
  }
}
