import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from 'src/app/user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'username' }); // by default "username". but it's ok, just play safe
  }

  async validate(username: string, password: string): Promise<User> {
    const user: User = await this.authService.validateUser({
      username,
      password,
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
