
export type UserRole = 'shipper' | 'carrier' | 'admin';
export type PublicUserRole = Exclude<UserRole, 'admin'>;

export type HydroUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  approved: boolean;
  avatarUrl?: string;
  countryCode?: string;
  phone?: string;
  phoneE164?: string;
  city?: string;
  passwordHash?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicHydroUser = Omit<HydroUser, 'passwordHash'>;

export type LoginPayload = {
  email?: string;
  identifier?: string;
  password: string;
  otp?: string;
  challenge?: string;
};

export type LoginResult = {
  user?: HydroUser;
  otpRequired?: boolean;
  otpCode?: string;
  challenge?: string;
  expiresAt?: string;
  expiresInSeconds?: number;
};

/** Resposta da etapa 1 do cadastro (OTP pendente). */
export type RegisterOtpChallengeResponse = {
  otpRequired: true;
  challenge: string;
  otpCode?: string;
  expiresAt: string;
  expiresInSeconds: number;
};

export type RegisterPayload = {
  /** Preferir `fullName`; `name` mantido por compatibilidade com payloads antigos. */
  fullName: string;
  name?: string;
  email: string;
  password: string;
  company: string;
  role: PublicUserRole;
  countryCode: string;
  phone: string;
  phoneE164?: string;
  otp?: string;
  challenge?: string;
};
