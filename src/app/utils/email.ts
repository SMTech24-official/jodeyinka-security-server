import nodemailer from 'nodemailer';
export default class Email {
  to: string;
  firstName: string;
  from: string;
  subject: any;
  constructor(user: any) {
    this.to = user.email || process.env.EMAIL_FROM;
    this.firstName = user.firstName || 'admin';
    this.from = `WSF <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sending real email with ZOHO
      return nodemailer.createTransport({
        host: process.env.ZOHO_HOST,
        port: process.env.ZOHO_PORT,
        secure: false,
        auth: {
          user: process.env.ZOHO_USER,
          pass: process.env.ZOHO_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      } as any);
    }

    //Sending dummy emails to mailtrap for development
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    } as any);
  }

  //Send the actual email

  async send(template: string, subject: string) {
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
    await this.newTransport().sendMail(mailOptions);
  }
  async sendEmailVerificationLink(
    // template: string,
    subject: string,
    link: string,
  ) {
    //01. Render HTML using the PUG template from the arguments
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - WSF</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
        }
        .header {
            background-color: #000033;
            padding: 32px 24px;
            text-align: center;
        }
        .logo-container {
            display: inline-block;
        }
        .logo {
            width: 140px;
            height: auto;
        }
        .content {
            padding: 48px 24px;
            background: #ffffff;
        }
        .title {
            color: #000033;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 24px;
            text-align: center;
        }
        .text {
            color: #333333;
            font-size: 16px;
            line-height: 24px;
            margin: 0 0 24px;
        }
        .button {
            display: inline-block;
            background-color: #0066FF;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 32px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 16px;
            margin: 32px 0;
        }
        .button-container {
            text-align: center;
        }
        .divider {
            border: none;
            border-top: 1px solid #e1e1e1;
            margin: 32px 0;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 24px;
            text-align: center;
        }
        .footer-text {
            color: #666666;
            font-size: 12px;
            margin: 0 0 12px;
        }
        .highlight {
            color: #0066FF;
            font-weight: 500;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .content {
                padding: 32px 16px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%2010-SBHTzfihpSfeUtsH8IHib5Yb1SHW5W.png" alt="WSF Logo" class="logo">
            </div>
        </div>
        <div class="content">
            <h1 class="title">Verify your email address</h1>
            <p class="text">Welcome to WSF!</p>
            <p class="text">To complete your registration and access all features of your account, please verify your email address by clicking the button below:</p>
            <div class="button-container">
                <a href="${link}" class="button">Verify Email Address</a>
            </div>
            <p class="text">This verification link will expire in an hour for security reasons.</p>
            <p class="text">If you didn't create an account with WSF, you can safely ignore this email.</p>
            <hr class="divider">
            <p class="text">Need help? Contact our support team at <span class="highlight">members@worldcybersecurityforum.org</span></p>
        </div>
        <div class="footer">
            <p class="footer-text">&copy; 2024 WSF. All rights reserved.</p>
            <p class="footer-text">This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
    //02. Define mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };
    //03. Create a transporter and send the mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to XYZ');
  }

  async sendPasswordReset(OTP: string) {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Code - WSF</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
        }
        .header {
            background-color: #000033;
            padding: 32px 24px;
            text-align: center;
        }
        .logo-container {
            display: inline-block;
        }
        .logo {
            width: 140px;
            height: auto;
        }
        .content {
            padding: 48px 24px;
            background: #ffffff;
        }
        .title {
            color: #000033;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 24px;
            text-align: center;
        }
        .text {
            color: #333333;
            font-size: 16px;
            line-height: 24px;
            margin: 0 0 24px;
        }
        .otp-container {
            text-align: center;
            margin: 32px 0;
            padding: 24px;
            background-color: #f8f8f8;
            border-radius: 8px;
        }
        .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 4px;
            color: #0066FF;
            margin: 0;
            padding: 8px 0;
        }
        .otp-expires {
            font-size: 14px;
            color: #666666;
            margin: 8px 0 0;
        }
        .divider {
            border: none;
            border-top: 1px solid #e1e1e1;
            margin: 32px 0;
        }
        .security-notice {
            background-color: #fff8e6;
            border-left: 4px solid #ffd700;
            padding: 16px;
            margin: 24px 0;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 24px;
            text-align: center;
        }
        .footer-text {
            color: #666666;
            font-size: 12px;
            margin: 0 0 12px;
        }
        .highlight {
            color: #0066FF;
            font-weight: 500;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .content {
                padding: 32px 16px !important;
            }
            .otp-code {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%2010-SBHTzfihpSfeUtsH8IHib5Yb1SHW5W.png" alt="WSF Logo" class="logo">
            </div>
        </div>
        <div class="content">
            <h1 class="title">Password Reset Code</h1>
            <p class="text">Hello,</p>
            <p class="text">We received a request to reset the password for your WSF account. Use the code below to complete the password reset process:</p>
            
            <div class="otp-container">
                <p class="otp-code">${OTP}</p>
                <p class="otp-expires">This code will expire in 15 minutes</p>
            </div>

            <div class="security-notice">
                <p class="text" style="margin: 0;">
                    <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately. Someone may be trying to access your account.
                </p>
            </div>

            <hr class="divider">
            
            <p class="text">For your security:</p>
            <ul>
                <li>Never share this code with anyone</li>
                <li>WSF will never ask you for this code via phone or email</li>
                <li>Always ensure you're on the official WSF website before entering this code</li>
            </ul>
            
            <p class="text">Need help or have concerns? Contact our support team at <span class="highlight">members@worldcybersecurityforum.org</span></p>
        </div>
        <div class="footer">
            <p class="footer-text">&copy; 2024 WSF. All rights reserved.</p>
            <p class="footer-text">This is an automated message, please do not reply to this email.</p>
            <p class="footer-text">Sent by WSF • Password Reset Service</p>
        </div>
    </div>
</body>
</html>`;
    await this.send(html, 'Reset your password');
  }

  async sendContactMail(data: any) {
    const template = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission - WSF</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
        }
        .header {
            background-color: #000033;
            padding: 32px 24px;
            text-align: center;
        }
        .logo-container {
            display: inline-block;
        }
        .logo {
            width: 140px;
            height: auto;
        }
        .content {
            padding: 48px 24px;
            background: #ffffff;
        }
        .title {
            color: #000033;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 24px;
        }
        .text {
            color: #333333;
            font-size: 16px;
            line-height: 24px;
            margin: 0 0 24px;
        }
        .details-container {
            background-color: #f8f8f8;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .field-group {
            margin-bottom: 16px;
        }
        .field-label {
            color: #666666;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .field-value {
            color: #000033;
            font-size: 16px;
            margin: 0;
        }
        .message-box {
            background-color: #ffffff;
            border: 1px solid #e1e1e1;
            border-radius: 4px;
            padding: 16px;
            margin-top: 8px;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 24px;
            text-align: center;
        }
        .footer-text {
            color: #666666;
            font-size: 12px;
            margin: 0 0 12px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .content {
                padding: 32px 16px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%2010-SBHTzfihpSfeUtsH8IHib5Yb1SHW5W.png" alt="WSF Logo" class="logo">
            </div>
        </div>
        <div class="content">
            <h1 class="title">New Contact Form Submission</h1>
            <p class="text">A new inquiry has been submitted through the contact form. Here are the details:</p>
            
            <div class="details-container">
                <div class="field-group">
                    <div class="field-label">Name</div>
                    <p class="field-value">${data.name}</p>
                </div>
                
                <div class="field-group">
                    <div class="field-label">Email/Phone</div>
                    <p class="field-value">${data.email}</p>
                </div>
                
                <div class="field-group">
                    <div class="field-label">Location</div>
                    <p class="field-value">${data.state}, ${data.country}</p>
                </div>
                
                <div class="field-group">
                    <div class="field-label">Address</div>
                    <p class="field-value">${data.address}</p>
                </div>
                
                <div class="field-group">
                    <div class="field-label">Subject</div>
                    <p class="field-value">${data.subject}</p>
                </div>
                
                <div class="field-group">
                    <div class="field-label">Message</div>
                    <div class="message-box">
                        <p class="field-value" style="white-space: pre-wrap;">${data.message}</p>
                    </div>
                </div>
            </div>
            
            <p class="text">Please respond to this inquiry within 24 hours.</p>
        </div>
        <div class="footer">
            <p class="footer-text">&copy; 2024 WSF. All rights reserved.</p>
            <p class="footer-text">This email was sent from the WSF Contact Form</p>
        </div>
    </div>
</body>
</html>`;
    await this.send(template, 'Contact Message');
  }
}
