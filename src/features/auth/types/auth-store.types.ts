export interface OrgMetadata {
  org_id: string;
  org_logo_url: string | null;
  org_name: string;
  org_type: "INDIVIDUAL" | "MULTI_TENANT" | "COMPANY";
  owner: boolean;
  role: "ADMIN" | "MEMBER";
}

export interface AuthMethod {
  method: string;
  timestamp: number;
}

export interface AppMetadata {
  provider: string;
  providers: string[];
}

export interface UserMetadata {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface DecodedJWT {
  aal: string;
  amr: AuthMethod[];
  app_metadata: AppMetadata;
  aud: string;
  email: string;
  exp: number;
  first_name: string;
  iat: number;
  is_anonymous: boolean;
  iss: string;
  last_name: string;
  onboarding_complete: boolean;
  orgs: OrgMetadata[];
  phone: string;
  profile_picture_url: string | null;
  role: "ADMIN" | "USER";
  session_id: string;
  sub: string;
  user_metadata: UserMetadata;
}

export interface CurrentUserType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePictureUrl: string | null;
  phone: string;
  role: "ADMIN" | "USER";
  onboardingComplete: boolean;
  accountType: "INDIVIDUAL" | "MULTI_TENANT" | "COMPANY" | undefined;
  orgName: string;
}
