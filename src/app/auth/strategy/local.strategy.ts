import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ValidateUserRequestDto } from '../dto/validate-user.dto';
import { User } from 'src/app/user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'username' }); // by default "username". but it's ok, just play safe
  }

  async validate(
    validateUserRequestDto: ValidateUserRequestDto,
  ): Promise<User> {
    const user: User = await this.authService.validateUser(
      validateUserRequestDto,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
