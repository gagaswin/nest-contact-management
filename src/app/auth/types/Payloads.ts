export interface AccessTokenPayload {
  userId: string;
  username: string;
}

export interface VerifyRefreshTokenPayload extends AccessTokenPayload {
  refreshToken: string;
}
