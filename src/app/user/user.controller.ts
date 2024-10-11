import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WebResponse } from '../web-response';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(
    @Body() registerUserDto: RegisterUserRequestDto,
  ): Promise<WebResponse<RegisterUserResponseDto>> {
    const result = await this.userService.register(registerUserDto);
    return {
      data: result,
    };
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
