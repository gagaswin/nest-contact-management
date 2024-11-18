import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AccessToken, Tokens } from './types/Tokens';
import { RegisterUserRequestDto } from './dto/register-user.dto';
import { ValidationService } from 'src/common/validation.service';
import { UserValidation } from '../user/user.validation';
import { ValidateUserRequestDto } from './dto/validate-user.dto';
import { ConfigService } from '@nestjs/config';
import {
  AccessTokenPayload,
  VerifyRefreshTokenPayload,
} from './types/Payloads';
import { InjectRepository } from '@nestjs/typeorm';
import AuthJwtRefresh from './entities/auth-jwt-refresh.entity';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
    @InjectRepository(AuthJwtRefresh)
    private readonly authjwtRefreshRepository: Repository<AuthJwtRefresh>,
  ) {}

  private async generateAccessTokens(
    payload: AccessTokenPayload,
  ): Promise<string> {
    const accessToken: string = this.jwtService.sign(payload);

    const decoded: jwt.JwtPayload = jwt.decode(accessToken) as jwt.JwtPayload;
    console.info('accessToken iat: ', new Date(decoded.iat! * 1000));
    console.info('accessToken exp: ', new Date(decoded.exp! * 1000));

    return accessToken;
  }

  private async generateRefreshToken(
    payload: AccessTokenPayload,
  ): Promise<string> {
    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      expiresIn: this.configService.get<string>(
        'REFRESH_TOKEN_VALIDITY_DURATION',
      ),
    });

    const decoded: jwt.JwtPayload = jwt.decode(refreshToken) as jwt.JwtPayload;
    console.info('refreshToken iat: ', new Date(decoded.iat! * 1000));
    console.info('refreshToken exp: ', new Date(decoded.exp! * 1000));

    await this.authjwtRefreshRepository.save({
      refreshToken,
      issuedAt: new Date(decoded.iat! * 1000),
      exipresAt: new Date(decoded.exp! * 1000),
      userId: payload.userId,
    });

    return refreshToken;
  }

  async verifyAndExtractUser(refreshToken: string): Promise<User> {
    try {
      const refreshPayload: VerifyRefreshTokenPayload =
        this.jwtService.verify<VerifyRefreshTokenPayload>(refreshToken, {
          secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
        });

      const user: User = await this.userService.findOneUserById(
        refreshPayload.userId,
      );
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const refreshInDb: AuthJwtRefresh =
        await this.authjwtRefreshRepository.findOneBy({
          refreshToken,
          inactive: false,
        });
      if (!refreshInDb) {
        throw new UnauthorizedException('Refresh token mismatch or invalid');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid or expired refresh token: ${error}`,
      );
    }
  }

  async loginUser(user: User): Promise<Tokens> {
    const payload: AccessTokenPayload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken: string = await this.generateAccessTokens(payload);
    const refreshToken: string = await this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async renewAccessToken(user: User): Promise<AccessToken> {
    const payload: AccessTokenPayload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken: string = await this.generateAccessTokens(payload);

    return { accessToken };
  }

  async validateUser(
    validateUserRequestDto: ValidateUserRequestDto,
  ): Promise<User> {
    const { username, password }: ValidateUserRequestDto =
      this.validationService.validate<ValidateUserRequestDto>(
        UserValidation.VALIDATE_USER,
        validateUserRequestDto,
      );

    const user: User = await this.userService.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException('Username or password wrong!');
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Username or password wrong!');
    }

    return user;
  }

  async registerUser(
    registerUserRequestDto: RegisterUserRequestDto,
  ): Promise<Tokens> {
    const { username, name, password }: RegisterUserRequestDto =
      this.validationService.validate<RegisterUserRequestDto>(
        UserValidation.REGISTER,
        registerUserRequestDto,
      );

    const existingUser: boolean = await this.userService.isUserExist(username);

    if (existingUser) {
      throw new BadRequestException('Username already exist');
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const newUser: User = await this.userService.create({
      username,
      name,
      password: hashedPassword,
    });

    return this.loginUser(newUser);
  }

  async logoutUser(
    refreshToken: string,
    userId: string,
  ): Promise<{ message: string }> {
    const updateResult: UpdateResult =
      await this.authjwtRefreshRepository.update(
        { refreshToken, userId },
        { inactive: true },
      );

    if (updateResult.affected === 0) {
      throw new InternalServerErrorException('Logout failed');
    }

    return {
      message: 'Logout success',
    };
  }
}
