import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserRequestDto } from './register-user.dto';

export class UpdateUserDto extends PartialType(RegisterUserRequestDto) {}
