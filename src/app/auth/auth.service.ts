import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccessToken } from './types/AccessToken';
import { RegisterUserRequestDto } from './dto/register-user.dto';
import { ValidationService } from 'src/common/validation.service';
import { UserValidation } from '../user/user.validation';
import { ValidateUserRequestDto } from './dto/validate-user.dto';
import { AccessTokenPayload } from './types/AccessTokenPayload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
  ) {}

  async validateUser(
    validateUserRequestDto: ValidateUserRequestDto,
  ): Promise<User> {
    const { username, password }: ValidateUserRequestDto =
      this.validationService.validate<ValidateUserRequestDto>(
        UserValidation.LOGIN,
        validateUserRequestDto,
      );

    const user: User = await this.userService.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException('Username or password wrong!');
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Username or password wrong!');
    }

    return user;
  }

  async loginUser(user: User): Promise<AccessToken> {
    const payload: AccessTokenPayload = {
      userId: user.id,
      username: user.username,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async registerUser(
    registerUserRequestDto: RegisterUserRequestDto,
  ): Promise<AccessToken> {
    const { username, name, password }: RegisterUserRequestDto =
      this.validationService.validate<RegisterUserRequestDto>(
        UserValidation.REGISTER,
        registerUserRequestDto,
      );

    const existingUser: boolean = await this.userService.isUserExist(username);

    if (existingUser) {
      throw new BadRequestException('Username already exist');
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const newUser: User = await this.userService.create({
      username,
      name,
      password: hashedPassword,
    });

    return this.loginUser(newUser);
  }
}
