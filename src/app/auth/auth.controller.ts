import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginUserRequestDto } from './dto/login-user.dto';
import { RegisterUserRequestDto } from './dto/register-user.dto';
import { Public } from './decorator/public.decorator';
import { AccessToken } from './types/AccessToken';

@Public()
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(
    @Request() loginUserRequestDto: LoginUserRequestDto,
  ): Promise<AccessToken | BadRequestException> {
    const loginResult: AccessToken = await this.authService.loginUser(
      loginUserRequestDto.user,
    );
    return loginResult;
  }

  @Post('/register')
  async register(
    @Body() registerUSerRequestDto: RegisterUserRequestDto,
  ): Promise<AccessToken | BadRequestException> {
    const registerResult: AccessToken = await this.authService.registerUser(
      registerUSerRequestDto,
    );
    return registerResult;
  }
}
