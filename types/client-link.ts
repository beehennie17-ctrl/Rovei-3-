export type ClientLinkPrototype = {
  token: string;
  createdAt: string;
};

export type SecureClientLink = {
  token: string;
  createdAt: string;
  expiresAt: string;
};

export type SecureClientLinkStatus =
  | "active"
  | "revoked"
  | "expired";

export type IssuedClientExperienceLink = {
  clientExperienceId: string;
  clientId: string;
  appointmentId: string;
  link: SecureClientLink;
};

export type PublicClientExperienceLink = {
  status:
    SecureClientLinkStatus;

  expiresAt:
    string | null;
};
