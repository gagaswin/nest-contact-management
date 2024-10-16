import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import {
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';
import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from './dto/update-user.dto';
import { WebResponse } from '../web-response';
import {
  LoginUserRequestDto,
  LoginUserResponseDto,
} from './dto/login-user.dto';
import { Auth } from 'src/common/auth.decorator';
import { User } from './entities/user.entity';
import { GetUserResponseDto } from './dto/get-user.dto';
import { LogoutUserResponseDto } from './dto/logout-user';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async registerUser(
    @Body() registerUserDto: RegisterUserRequestDto,
  ): Promise<WebResponse<RegisterUserResponseDto>> {
    const result = await this.userService.register(registerUserDto);
    return {
      data: result,
    };
  }

  @Post('/login')
  async loginUser(
    @Body() loginUserRequestDto: LoginUserRequestDto,
  ): Promise<WebResponse<LoginUserResponseDto>> {
    const result = await this.userService.login(loginUserRequestDto);
    return {
      data: result,
    };
  }

  @Get('/current')
  async getUser(@Auth() user: User): Promise<WebResponse<GetUserResponseDto>> {
    const result = await this.userService.getUser(user);
    return {
      data: result,
    };
  }

  @Patch('/current')
  async updateUser(
    @Auth() user: User,
    @Body() updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<WebResponse<UpdateUserResponseDto>> {
    const result = await this.userService.updateUser(
      user,
      updateUserRequestDto,
    );
    return {
      data: result,
    };
  }

  @Delete('/current')
  async logoutUser(
    @Auth() user: User,
  ): Promise<WebResponse<LogoutUserResponseDto>> {
    const result = await this.userService.logoutUser(user);
    return {
      data: result,
    };
  }
}
