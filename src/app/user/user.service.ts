import { HttpException, Injectable } from '@nestjs/common';
import {
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';
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
import {
  LoginUserRequestDto,
  LoginUserResponseDto,
} from './dto/login-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { GetUserResponseDto } from './dto/get-user.dto';
import { LogoutUserResponseDto } from './dto/logout-user';

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
      this.validationService.validate<RegisterUserRequestDto>(
        UserValidation.REGISTER,
        registerUserDto,
      );

    const userExist = await this.userRepository.exists({
      where: {
        username: registerRequest.username,
      },
    });

    if (userExist) throw new HttpException('Username already exist', 400);

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const { username, password, name } = registerRequest;
    const userRegister = await this.userRepository.save({
      username: username,
      password: password,
      name: name,
    });
    // const { password: _, ...userWithoutPassword } = user;
    return {
      username: userRegister.username,
      name: userRegister.name,
    };
  }

  async login(
    loginUserRequestDto: LoginUserRequestDto,
  ): Promise<LoginUserResponseDto> {
    const loginRequest: LoginUserRequestDto =
      this.validationService.validate<LoginUserRequestDto>(
        UserValidation.LOGIN,
        loginUserRequestDto,
      );

    let user: User = await this.userRepository.findOneBy({
      username: loginRequest.username,
    });
    if (!user) throw new HttpException('Username or password is wrong', 401);

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new HttpException('Username or password is wrong', 401);

    const token: string = uuidv4();

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ token })
      .where('username = :username', { username: user.username })
      .execute();

    return {
      username: user.username,
      name: user.name,
      token: token,
    };
  }

  async getUser(user: User): Promise<GetUserResponseDto> {
    return {
      username: user.name,
      name: user.name,
    };
  }

  async updateUser(
    user: User,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UpdateUserResponseDto> {
    const updateUser: UpdateUserRequestDto = this.validationService.validate(
      UserValidation.UPDATE,
      updateUserRequestDto,
    );

    if (updateUser.name) user.name = updateUser.name;
    if (updateUser.password)
      user.password = await bcrypt.hash(updateUser.password, 10);

    await this.userRepository.save(user);

    return {
      username: user.username,
      name: user.name,
    };
  }

  async logoutUser(user: User): Promise<LogoutUserResponseDto> {
    const result = await this.userRepository.update(user.username, {
      token: null,
    });

    let isLogout: boolean = false;
    if (result.affected && result.affected > 0) {
      isLogout = true;
    }

    return {
      username: user.username,
      isLogout: isLogout,
    };
  }
}
