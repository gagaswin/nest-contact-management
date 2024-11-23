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
import { AuthTokenService } from './auth.token-service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authTokenService: AuthTokenService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
    @InjectRepository(AuthJwtRefresh)
    private readonly authjwtRefreshRepository: Repository<AuthJwtRefresh>,
  ) {}

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

  async loginUser(user: User): Promise<Tokens> {
    const payload: AccessTokenPayload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken: string =
      await this.authTokenService.generateAccessTokens(payload);
    const refreshToken: string =
      await this.authTokenService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
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

  async renewAccessToken(user: User): Promise<AccessToken> {
    const payload: AccessTokenPayload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken: string =
      await this.authTokenService.generateAccessTokens(payload);

    return { accessToken };
  }

  // async logoutUser(
  //   refreshToken: string,
  //   userId: string,
  // ): Promise<{ message: string }> {
  //   const updateResult: UpdateResult =
  //     await this.authjwtRefreshRepository.update(
  //       { refreshToken, userId },
  //       { inactive: true },
  //     );

  //   if (updateResult.affected === 0) {
  //     throw new InternalServerErrorException('Logout failed');
  //   }

  //   return {
  //     message: 'Logout success',
  //   };
  // }
}
