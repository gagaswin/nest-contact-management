import { HttpException, Injectable } from '@nestjs/common';
import {
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationService } from 'src/common/validation.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly validationService: ValidationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async register(
    registerUserDto: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto> {
    const registerRequest: RegisterUserRequestDto =
      this.validationService.validate(UserValidation.REGISTER, registerUserDto);
    const userExist = await this.userRepository.exists({
      where: {
        username: registerRequest.username,
      },
    });
    if (userExist) throw new HttpException('Username already exist', 400);
    registerUserDto.password = await bcrypt.hash(registerUserDto.password, 10);
    const { username, password, name } = registerUserDto;
    const user = await this.userRepository.save({
      username: username,
      password: password,
      name: name,
    });
    // const { password: _, ...userWithoutPassword } = user;
    return {
      username: user.username,
      name: user.name,
    };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
