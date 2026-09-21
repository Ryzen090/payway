import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',

      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',

      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',

      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;

    return {
      _id: profile.id,
      email,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      picture: profile.photos?.[0]?.value,
      phone:
        (profile as any).phone || (profile as any)._json?.phone_number || '',
    };
  }
}
