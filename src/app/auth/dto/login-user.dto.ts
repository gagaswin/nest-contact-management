import { User } from 'src/app/user/entities/user.entity';

export class LoginUserRequestDto extends Request {
  user: User;
}
