import crypto from 'crypto';
import { Request } from 'express';
const generateHashedToken = (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return hashedToken;
};
const generateEmailVerificationLink = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const emailVerificationLink = `https://www.worldcybersecurityforum.org/verify-email/${token}`;
  const hashedToken = generateHashedToken(token);
  return [emailVerificationLink, hashedToken];
};
export const verification = {
  generateEmailVerificationLink,
  generateHashedToken,
};
