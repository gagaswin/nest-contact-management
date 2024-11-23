import { Injectable } from '@nestjs/common';
import { AccessTokenPayload } from './types/Payloads';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import AuthJwtRefresh from './entities/auth-jwt-refresh.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(AuthJwtRefresh)
    private readonly authjwtRefreshRepository: Repository<AuthJwtRefresh>,
  ) {}

  async generateAccessTokens(payload: AccessTokenPayload): Promise<string> {
    const accessToken: string = this.jwtService.sign(payload);

    // const decoded: jwt.JwtPayload = jwt.decode(accessToken) as jwt.JwtPayload;
    // console.info('accessToken iat: ', new Date(decoded.iat! * 1000));
    // console.info('accessToken exp: ', new Date(decoded.exp! * 1000));

    return accessToken;
  }

  async generateRefreshToken(payload: AccessTokenPayload): Promise<string> {
    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      expiresIn: this.configService.get<string>(
        'REFRESH_TOKEN_VALIDITY_DURATION',
      ),
    });

    const decoded: jwt.JwtPayload = jwt.decode(refreshToken) as jwt.JwtPayload;
    // console.info('refreshToken iat: ', new Date(decoded.iat! * 1000));
    // console.info('refreshToken exp: ', new Date(decoded.exp! * 1000));

    await this.authjwtRefreshRepository.save({
      refreshToken,
      issuedAt: new Date(decoded.iat! * 1000),
      exipresAt: new Date(decoded.exp! * 1000),
      userId: payload.userId,
    });

    return refreshToken;
  }
}
