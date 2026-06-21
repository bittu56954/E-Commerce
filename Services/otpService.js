import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Initialize email transporter if settings exist
const getEmailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass
      }
    });
  }
  return null;
};

// Initialize Twilio client if settings exist
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (accountSid && authToken && fromNumber) {
    return {
      client: twilio(accountSid, authToken),
      from: fromNumber
    };
  }
  return null;
};

export const sendEmailOTP = async (email, otp) => {
  const transporter = getEmailTransporter();
  
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'zomato Support'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔐 Your zomato Security Verification Code',
        text: `Your zomato security verification code is: ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
            <h2 style="color: #e23744; text-align: center;">zomato</h2>
            <hr style="border: 0; border-top: 1px solid #e1e1e1;" />
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">Your security verification code is:</p>
            <div style="background-color: #f9f9f9; border: 1px dashed #e23744; border-radius: 6px; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e23744; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #666; text-align: center;">This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            <hr style="border: 0; border-top: 1px solid #e1e1e1; margin-top: 30px;" />
            <p style="font-size: 12px; color: #999; text-align: center;">This is an automated email from the zomato engine. Please do not reply.</p>
          </div>
        `
      });
      console.log(`[EMAIL SENT] Message ID: ${info.messageId} to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending Email OTP via SMTP:', error.message);
    }
  }

  // Fallback / Sandbox logging
  console.log('====================================================');
  console.log(`📡 SMTP SANDBOX FALLBACK: Email OTP Code`);
  console.log(`📧 Recipient: ${email}`);
  console.log(`🔑 OTP CODE:  [ ${otp} ]`);
  console.log(`💡 Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env for live mail delivery.`);
  console.log('====================================================');
  return false;
};

export const sendSmsOTP = async (phone, otp) => {
  const twilioConfig = getTwilioClient();

  if (twilioConfig) {
    try {
      const message = await twilioConfig.client.messages.create({
        body: `Your zomato security verification code is: ${otp}. Valid for 5 minutes.`,
        from: twilioConfig.from,
        to: phone
      });
      console.log(`[SMS SENT] SID: ${message.sid} to ${phone}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS OTP via Twilio:', error.message);
    }
  }

  // Fallback / Sandbox logging
  console.log('====================================================');
  console.log(`📡 SMS SANDBOX FALLBACK: Mobile OTP Code`);
  console.log(`📱 Recipient: ${phone}`);
  console.log(`🔑 OTP CODE:  [ ${otp} ]`);
  console.log(`💡 Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in .env for live SMS delivery.`);
  console.log('====================================================');
  return false;
};
