import { Controller, Get, Body, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from './dto/update-user.dto';
import { WebResponse } from '../web-response';
import { UserResponseDto } from './dto/common-user.dto';
import { UserAuth } from '../auth/decorator/user-auth.decorator';
import IJwtPayload from 'src/utils/types/IJwtPayload.interface';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/current')
  async getUser(
    @UserAuth() user: IJwtPayload,
  ): Promise<WebResponse<UserResponseDto>> {
    const getResult: UserResponseDto = await this.userService.get(user.userId);
    return {
      data: getResult,
    };
  }

  @Patch('/current')
  async updateUser(
    @UserAuth() user: IJwtPayload,
    @Body() updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<WebResponse<UpdateUserResponseDto>> {
    const updateResult: UpdateUserResponseDto = await this.userService.update(
      user.userId,
      updateUserRequestDto,
    );

    return {
      data: updateResult,
    };
  }
}
