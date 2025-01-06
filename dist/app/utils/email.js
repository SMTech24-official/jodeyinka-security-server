"use strict";
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
const nodemailer_1 = __importDefault(require("nodemailer"));
class Email {
    constructor(user) {
        this.to = user.email;
        this.firstName = user.firstName;
        this.from = `Mashrafie Rahim Sheikh <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //Sending real email with Brevo
            return nodemailer_1.default.createTransport({
                host: process.env.EMAIL_BREVO_HOST,
                port: process.env.EMAIL_BREVO_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_BREVO_USER,
                    pass: process.env.EMAIL_BREVO_PASSWORD,
                },
            });
        }
        //Sending dummy emails to mailtrap for development
        return nodemailer_1.default.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });
    }
    //Send the actual email
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            //01. Render HTML using the PUG template from the arguments
            const html = template;
            //02. Define mail options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
            };
            //03. Create a transporter and send the mail
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    sendEmailVerificationLink(
    // template: string,
    subject, link) {
        return __awaiter(this, void 0, void 0, function* () {
            //01. Render HTML using the PUG template from the arguments
            const html = `Your email verification link is: ${link}`;
            //02. Define mail options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
            };
            //03. Create a transporter and send the mail
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    sendWelcome() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('welcome', 'Welcome to the Natours family!');
        });
    }
    sendPasswordReset() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('passwordReset', 'Reset your password');
        });
    }
}
exports.default = Email;
// const sendEmail = async (options) => {
//   //define the email options
//     // html:
//   };
//   //send the mail with nodemailer
//   await transporter.sendMail(mailOptions);
// };
