"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verification = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateHashedToken = (token) => {
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    return hashedToken;
};
const generateEmailVerificationLink = (req) => {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const emailVerificationLink = `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/verify-email/${token}`;
    const hashedToken = generateHashedToken(token);
    return [emailVerificationLink, hashedToken];
};
exports.verification = {
    generateEmailVerificationLink,
    generateHashedToken,
};
