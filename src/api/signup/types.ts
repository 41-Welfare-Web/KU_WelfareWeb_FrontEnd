export type ApiErrorBody = {
  errorCode?: string;
  message?: string;
};

export type RequestSignupVerificationRequest = {
  phoneNumber: string;
};

export type RequestSignupVerificationResponse = {
  message: string;
  code: string;
};

export type VerifySignupCodeRequest = {
  phoneNumber: string;
  verificationCode: string;
};

export type VerifySignupCodeResponse = {
  success: boolean;
  message: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  name: string;
  studentId: string;
  phoneNumber: string;
  department: string;
  verificationCode: string;
};

export type RegisterResponse = {
  user: { id: string; username: string; name: string; role: string };
  accessToken: string;
  refreshToken: string;
};

export type Unit = { id: number; name: string };

export type CommonMetadataResponse = {
  departments: string[];
  freePurposes?: unknown[];
  prices?: Record<string, unknown>;
};
