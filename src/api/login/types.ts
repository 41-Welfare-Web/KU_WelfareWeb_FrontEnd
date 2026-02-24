export type LoginResponse = {
  user: {
    id: string;
    username: string;
    name: string;
    role: "USER" | "ADMIN" | string;
  };
  accessToken: string;
  refreshToken: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};
