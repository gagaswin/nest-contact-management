import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserRequestDto } from './register-user.dto';

export class UpdateUserRequestDto extends PartialType(RegisterUserRequestDto) {
  name?: string;
  password?: string;
}

export class UpdateUserResponseDto extends PartialType(RegisterUserRequestDto) {
  username?: string;
  name?: string;
}
