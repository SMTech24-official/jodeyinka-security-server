import { SponsorStatus } from '@prisma/client';
import jwt, { Secret } from 'jsonwebtoken';

export const generateToken = (
  payload: {
    id: string;
    name: string;
    email: string;
    role: string;
    sponsorStatus: SponsorStatus;
  },
  secret: Secret,
  expiresIn: string,
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: expiresIn,
  });
  return token;
};
