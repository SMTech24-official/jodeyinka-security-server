"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const library_1 = require("@prisma/client/runtime/library");
const zod_1 = require("zod");
const AppError_1 = __importDefault(require("../errors/AppError"));
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const globalErrorHandler = (err, req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g;
    console.log(err);
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorDetails = {};
    if (err instanceof zod_1.ZodError) {
        // Handle Zod error
        const simplifiedError = (0, handleZodError_1.default)(err);
        statusCode = (simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode) || 400;
        message = (simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message) || 'Validation error';
        errorDetails = (simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorDetails) || {};
    }
    else if ((err === null || err === void 0 ? void 0 : err.code) === 'P2002') {
        // Handle Prisma Duplicate entity error
        statusCode = 409;
        message = `Duplicate entity on the fields:}`;
        errorDetails = { code: err.code, err };
    }
    else if ((err === null || err === void 0 ? void 0 : err.code) === 'P2003') {
        // Handle Prisma Foreign Key constraint error
        statusCode = 400;
        message = `Foreign key constraint failed on the field: ${(_a = err.meta) === null || _a === void 0 ? void 0 : _a.field_name}`;
        errorDetails = {
            code: err.code,
            field: (_b = err.meta) === null || _b === void 0 ? void 0 : _b.field_name,
            model: (_c = err.meta) === null || _c === void 0 ? void 0 : _c.modelName,
        };
    }
    else if ((err === null || err === void 0 ? void 0 : err.code) === 'P2011') {
        // Handle Prisma Null constraint violation error
        statusCode = 400;
        message = `Null constraint violation on the field: ${(_d = err.meta) === null || _d === void 0 ? void 0 : _d.field_name}`;
        errorDetails = { code: err.code, field: (_e = err.meta) === null || _e === void 0 ? void 0 : _e.field_name };
    }
    else if ((err === null || err === void 0 ? void 0 : err.code) === 'P2025') {
        // Handle Prisma Record not found error
        statusCode = 404;
        message = `Record not found: ${((_f = err.meta) === null || _f === void 0 ? void 0 : _f.cause) || 'No matching record found for the given criteria.'}`;
        errorDetails = { code: err.code, cause: (_g = err.meta) === null || _g === void 0 ? void 0 : _g.cause };
    }
    else if (err instanceof library_1.PrismaClientValidationError) {
        // Handle Prisma Validation errors
        statusCode = 400;
        message = 'Validation error in Prisma operation';
        errorDetails = { message: err.message };
    }
    else if (err instanceof library_1.PrismaClientKnownRequestError) {
        // Handle specific Prisma known errors
        statusCode = 400;
        message = err.message;
        errorDetails = { code: err.code, meta: err.meta };
    }
    else if (err instanceof library_1.PrismaClientUnknownRequestError) {
        // Handle Prisma unknown errors
        statusCode = 500;
        message = err.message;
        errorDetails = err;
    }
    else if (err instanceof AppError_1.default) {
        // Handle custom AppError
        statusCode = err.statusCode;
        message = err.message;
        errorDetails = { stack: err.stack };
    }
    else if (err instanceof Error) {
        // Handle generic Error
        message = err.message;
        errorDetails = { stack: err.stack };
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorDetails,
    });
};
exports.default = globalErrorHandler;
