import { Injectable } from '@nestjs/common';
import { RegisterUserRequestDto } from '../auth/dto/register-user.dto';
import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from './dto/update-user.dto';
import { ValidationService } from 'src/common/validation.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from './dto/common-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly validationService: ValidationService,
  ) {}

  // common \\
  async findOneUserById(userId: string): Promise<User> {
    return this.userRepository.findOneBy({ id: userId });
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.userRepository.findOneBy({ username });
  }

  async isUserExist(username: string): Promise<boolean> {
    return this.userRepository.existsBy({ username });
  }

  async create(registerUserRequestDto: RegisterUserRequestDto): Promise<User> {
    return this.userRepository.save(registerUserRequestDto);
  }

  // service \\
  async get(userId: string): Promise<UserResponseDto> {
    const { username, name }: User = await this.findOneUserById(userId);
    return { username, name };
  }

  async update(
    userId: string,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UpdateUserResponseDto> {
    const { name, password }: UpdateUserRequestDto =
      this.validationService.validate<UpdateUserRequestDto>(
        UserValidation.UPDATE,
        updateUserRequestDto,
      );

    const user: User = await this.findOneUserById(userId);

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    const updateResult = await this.userRepository.save(user);

    return {
      username: updateResult.username,
      name: updateResult.name,
    };
  }
}
