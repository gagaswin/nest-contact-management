export class LoginUserRequestDto {
  username: string;
  password: string;
}

export class LoginUserResponseDto {
  username: string;
  name: string;
  token: string;
}
