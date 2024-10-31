import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserRequestDto } from './dto/register-user.dto';
import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from './dto/update-user.dto';
import { WebResponse } from '../web-response';
import { LoginUserRequestDto } from './dto/login-user.dto';
import { Auth } from 'src/common/auth.decorator';
import { User } from './entities/user.entity';
import { LogoutUserResponseDto } from './dto/logout-user';
import { UserResponseDto } from './dto/common-user.dto';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async registerUser(
    @Body() registerUserDto: RegisterUserRequestDto,
  ): Promise<WebResponse<UserResponseDto>> {
    const registerResult: UserResponseDto =
      await this.userService.register(registerUserDto);

    return {
      data: registerResult,
    };
  }

  @Post('/login')
  async loginUser(
    @Body() loginUserRequestDto: LoginUserRequestDto,
  ): Promise<WebResponse<UserResponseDto>> {
    const loginResult: UserResponseDto =
      await this.userService.login(loginUserRequestDto);

    return {
      data: loginResult,
    };
  }

  @Get('/current')
  async getUser(@Auth() user: User): Promise<WebResponse<UserResponseDto>> {
    const getResult: UserResponseDto = await this.userService.get(user);

    return {
      data: getResult,
    };
  }

  @Patch('/current')
  async updateUser(
    @Auth() user: User,
    @Body() updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<WebResponse<UpdateUserResponseDto>> {
    const updateResult: UpdateUserResponseDto = await this.userService.update(
      user,
      updateUserRequestDto,
    );

    return {
      data: updateResult,
    };
  }

  @Delete('/current')
  async logoutUser(
    @Auth() user: User,
  ): Promise<WebResponse<LogoutUserResponseDto>> {
    const logoutResult: LogoutUserResponseDto =
      await this.userService.logout(user);

    return {
      data: logoutResult,
    };
  }
}
