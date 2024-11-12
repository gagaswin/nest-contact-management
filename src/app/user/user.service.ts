import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterUserRequestDto } from '../auth/dto/register-user.dto';
import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from './dto/update-user.dto';
import { ValidationService } from 'src/common/validation.service';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from './dto/common-user.dto';
import removeUndefinedProperties from 'src/utils/helper/removeUndefinedProperties';
import { LogoutUserResponseDto } from './dto/logout-user';

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
    const { username, name, password }: UpdateUserRequestDto =
      this.validationService.validate<UpdateUserRequestDto>(
        UserValidation.UPDATE,
        updateUserRequestDto,
      );

    const user: User = await this.findOneUserById(userId);

    const updatedUserData: Partial<User> = { name }; // If the name is undefined then it will be ignored by the update method
    if (username) {
      const ussernameExist: boolean = await this.userRepository.existsBy({
        username,
      });
      if (ussernameExist && username !== user.username) {
        throw new BadRequestException('Username already exists');
      }
      updatedUserData.username = username;
    }
    if (password) updatedUserData.password = await bcrypt.hash(password, 10);

    const updateResult: UpdateResult = await this.userRepository.update(
      { id: user.id },
      updatedUserData,
    );

    if (updateResult.affected === 0) {
      throw new InternalServerErrorException('Update failed');
    }

    const updateResponse: UpdateUserResponseDto =
      removeUndefinedProperties<UpdateUserResponseDto>({
        username: updatedUserData.username,
        name: updatedUserData.name,
        password: updatedUserData.password
          ? 'Password successfully updated!'
          : undefined,
      });

    return updateResponse;
  }

  async logout(userId: string): Promise<LogoutUserResponseDto> {
    return;
  }
}
