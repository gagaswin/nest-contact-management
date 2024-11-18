import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginUserRequestDto } from './dto/login-user.dto';
import { RegisterUserRequestDto } from './dto/register-user.dto';
import { Public } from './decorator/public.decorator';
import { AccessToken, Tokens } from './types/Tokens';
import { User } from '../user/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Public()
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(
    @Request() loginUserRequestDto: LoginUserRequestDto,
  ): Promise<Tokens | BadRequestException> {
    const loginResult: Tokens = await this.authService.loginUser(
      loginUserRequestDto.user,
    );

    return loginResult;
  }

  @Post('/register')
  async register(
    @Body() registerUSerRequestDto: RegisterUserRequestDto,
  ): Promise<Tokens | BadRequestException> {
    const registerResult: Tokens = await this.authService.registerUser(
      registerUSerRequestDto,
    );

    return registerResult;
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AccessToken | UnauthorizedException> {
    const { refreshToken } = refreshTokenDto;
    const user: User =
      await this.authService.verifyAndExtractUser(refreshToken);

    return this.authService.renewAccessToken(user);
  }
}
