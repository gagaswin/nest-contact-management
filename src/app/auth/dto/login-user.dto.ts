import { User } from 'src/app/user/entities/user.entity';
import { AccessToken } from '../types/AccessToken';

export class LoginUserRequestDto extends Request {
  user: User;
}

// export class LoginUserResponseDto {
//   username: string;
//   name: string;
// }
