import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserRequestDto } from './dto/register-user.dto';
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
import { LoginUserRequestDto } from './dto/login-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { LogoutUserResponseDto } from './dto/logout-user';
import { UserResponseDto } from './dto/common-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly validationService: ValidationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(
    registerUserRequestDto: RegisterUserRequestDto,
  ): Promise<UserResponseDto> {
    const { username, name, password }: RegisterUserRequestDto =
      this.validationService.validate<RegisterUserRequestDto>(
        UserValidation.REGISTER,
        registerUserRequestDto,
      );

    const userExist: boolean = await this.userRepository.existsBy({
      username: username,
    });

    if (userExist) {
      throw new HttpException('Username already exist', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const userRegister: User = await this.userRepository.save({
      username: username,
      password: hashedPassword,
      name: name,
    });

    const {
      password: _,
      contacts: __,
      token: ___,
      ...responseRegister
    } = userRegister;

    return {
      username: responseRegister.username,
      name: responseRegister.name,
    };
  }

  async loginUser(
    loginUserRequestDto: LoginUserRequestDto,
  ): Promise<UserResponseDto> {
    const { username, password }: LoginUserRequestDto =
      this.validationService.validate<LoginUserRequestDto>(
        UserValidation.LOGIN,
        loginUserRequestDto,
      );

    const user: User = await this.userRepository.findOneBy({
      username: username,
    });

    if (!user) {
      throw new HttpException(
        'Username or password is wrong',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Username or password is wrong',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token: string = uuidv4();

    await this.userRepository
      .createQueryBuilder('user')
      .update(User)
      .set({ token })
      .where('user.username = :username', { username: user.username })
      .execute();

    return {
      username: user.username,
      name: user.name,
      token: token,
    };
  }

  async getUser(user: User): Promise<UserResponseDto> {
    return {
      username: user.name,
      name: user.name,
    };
  }

  async updateUser(
    user: User,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UpdateUserResponseDto> {
    const { name, password }: UpdateUserRequestDto =
      this.validationService.validate<UpdateUserRequestDto>(
        UserValidation.UPDATE,
        updateUserRequestDto,
      );

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await this.userRepository.save(user);

    return {
      username: user.username,
      name: user.name,
    };
  }

  async logoutUser(user: User): Promise<LogoutUserResponseDto> {
    const logoutResult: UpdateResult = await this.userRepository.update(
      { username: user.username },
      {
        token: null,
      },
    );

    if (logoutResult.affected === 0) {
      throw new HttpException(
        'Logout failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      username: user.username,
      isLogout: true,
    };
  }
}
