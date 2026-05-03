
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
  phone?: string;
  city?: string;
  passwordHash?: string;
};

export type PublicHydroUser = Omit<HydroUser, 'passwordHash'>;

export type LoginPayload = {
  email: string;
  password: string;
  otp?: string;
  challenge?: string;
};

export type LoginResult = {
  user?: HydroUser;
  otpRequired?: boolean;
  otpCode?: string;
  challenge?: string;
};

export type RegisterPayload = Omit<LoginPayload, 'otp' | 'challenge'> & {
  name: string;
  company: string;
  role: PublicUserRole;
};
