export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: ITokens;
}
