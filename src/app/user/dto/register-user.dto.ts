export class RegisterUserRequestDto {
  username: string;
  password: string;
  name: string;
}

export class RegisterUserResponseDto {
  username: string;
  name: string;
  token?: string;
}
