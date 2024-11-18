import { User } from 'src/app/user/entities/user.entity';

// export class RefreshTokenDto extends Request {
//   user: User;
// }

export class RefreshTokenDto {
  refreshToken: string;
}
