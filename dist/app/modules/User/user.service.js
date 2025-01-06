"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const email_1 = __importDefault(require("../../utils/email"));
const generateEmailVerificationLink_1 = require("../../helpers/generateEmailVerificationLink");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const registerUserIntoDB = (payload, emailVerificationLink, hashedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt.hash(payload.password, 12);
    const userData = Object.assign(Object.assign({}, payload), { password: hashedPassword });
    const newUser = yield prisma_1.default.user.create({
        data: Object.assign(Object.assign({}, userData), { emailVerificationToken: hashedToken, emailVerificationTokenExpires: new Date(Date.now() + 3600) }),
    });
    const email = new email_1.default(payload);
    yield email.sendEmailVerificationLink('Email verification link', emailVerificationLink);
    const userWithOptionalPassword = newUser;
    delete userWithOptionalPassword.password;
    return userWithOptionalPassword;
});
const getAllUsersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findMany({});
    return result;
});
const getMyProfileFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const Profile = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: id,
        },
    });
    return Profile;
});
const getUserDetailsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: { id },
    });
    return user;
});
const updateMyProfileIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = payload;
    delete userData.password;
    // update user data
    const updatedUser = yield prisma_1.default.user.update({
        where: { id },
        data: userData,
    });
    const userWithOptionalPassword = updatedUser;
    delete userWithOptionalPassword.password;
    return userWithOptionalPassword;
});
const updateUserRoleStatusIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.update({
        where: {
            id: id,
        },
        data: { role: payload.role },
    });
    return result;
});
const changePassword = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: userId,
            status: 'ACTIVE',
        },
    });
    const isCorrectPassword = yield bcrypt.compare(payload.password, userData.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password incorrect!');
    }
    const hashedPassword = yield bcrypt.hash(payload.newPassword, 12);
    yield prisma_1.default.user.update({
        where: {
            id: userData.id,
        },
        data: {
            password: hashedPassword,
        },
    });
    return {
        message: 'Password changed successfully!',
    };
});
const verifyUserEmail = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedToken = generateEmailVerificationLink_1.verification.generateHashedToken(token);
    const user = yield prisma_1.default.user.findFirst({
        where: {
            emailVerificationToken: hashedToken,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid email verification token.');
    }
    if (user.emailVerificationTokenExpires &&
        user.emailVerificationTokenExpires > new Date(Date.now())) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Email verification token has expired. Please try resending the verification email again.');
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            status: client_1.UserStatus.ACTIVE,
        },
    });
    return updatedUser;
});
exports.UserServices = {
    registerUserIntoDB,
    getAllUsersFromDB,
    getMyProfileFromDB,
    getUserDetailsFromDB,
    updateMyProfileIntoDB,
    updateUserRoleStatusIntoDB,
    changePassword,
    verifyUserEmail,
};
