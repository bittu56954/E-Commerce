import nodemailer from 'nodemailer';
import twilio from 'twilio';
import SettingsModel from '../Models/Settings.js';

let cachedEtherealTransporter = null;

export const sendEmailOTP = async (email, otp, phoneOtp = null) => {
  // Load SMTP configurations (try DB first, then let process.env take priority)
  let host = "";
  let port = 587;
  let user = "";
  let pass = "";
  let fromName = 'zomato Support';

  try {
    const dbSettings = await SettingsModel.get();
    if (dbSettings) {
      if (dbSettings.smtpHost) host = dbSettings.smtpHost;
      if (dbSettings.smtpPort) port = Number(dbSettings.smtpPort);
      if (dbSettings.smtpUser) user = dbSettings.smtpUser;
      if (dbSettings.smtpPass) pass = dbSettings.smtpPass;
      if (dbSettings.smtpFromName) fromName = dbSettings.smtpFromName;
    }
  } catch (err) {
    console.error('Failed to load SMTP settings from database:', err.message);
  }

  // Environment variables override database settings if provided
  if (process.env.SMTP_HOST) host = process.env.SMTP_HOST;
  if (process.env.SMTP_PORT) port = Number(process.env.SMTP_PORT);
  if (process.env.SMTP_USER) user = process.env.SMTP_USER;
  if (process.env.SMTP_PASS) pass = process.env.SMTP_PASS;
  if (process.env.SMTP_FROM_NAME) fromName = process.env.SMTP_FROM_NAME;

  let transporter = null;
  let isEthereal = false;

  if (host && user && pass) {
    const transporterConfig = {
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass
      }
    };

    // Use built-in gmail service profile for best SSL/TLS handshake compatibility with Gmail SMTP
    if (host.toLowerCase().includes('gmail.com') || host.toLowerCase().includes('gmail')) {
      transporterConfig.service = 'gmail';
    }

    transporter = nodemailer.createTransport(transporterConfig);
    
    // Proactively verify the SMTP connection settings and log issues to assist debugging
    try {
      console.log(`🔌 [SMTP] Verifying connection to ${host}:${port} with user "${user}"...`);
      await transporter.verify();
      console.log(`✅ [SMTP] Connection verified successfully! Transporter is ready.`);
    } catch (verifyError) {
      console.error(`❌ [SMTP] Connection verification failed:`, verifyError.message);
      if (host.includes('gmail.com')) {
        console.error(`💡 [SMTP DEBUG INFO]: For Gmail SMTP:`);
        console.error(`  1. Ensure you use an "App Password" (16 characters) generated from Google Account settings -> 2-Step Verification.`);
        console.error(`  2. Less Secure Apps access is deprecated and cannot be used anymore.`);
        console.error(`  3. Ensure SMTP_HOST is set to "smtp.gmail.com" and SMTP_PORT is "465" (secure: true) or "587" (secure: false).`);
      }
      console.error(`📂 [SMTP FALLBACK]: Will attempt mail dispatch but failure may occur. Check spam folder and SMTP logs.`);
    }

    if (host.includes('ethereal')) {
      isEthereal = true;
    }
  } else {
    // Zero-credential Ethereal test inbox fallback
    if (cachedEtherealTransporter) {
      transporter = cachedEtherealTransporter;
      isEthereal = true;
    } else {
      try {
        console.log('📡 [SMTP] Generating Ethereal SMTP test account for OTP delivery...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        cachedEtherealTransporter = transporter;
        isEthereal = true;
      } catch (e) {
        console.error('Failed to create Ethereal test account:', e.message);
      }
    }
  }

  // Check if Twilio config is available (DB or env) to render mock SMS
  let twilioActive = false;
  let twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  let twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  let twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

  try {
    const dbSettings = await SettingsModel.get();
    if (dbSettings) {
      if (dbSettings.twilioAccountSid) twilioAccountSid = dbSettings.twilioAccountSid;
      if (dbSettings.twilioAuthToken) twilioAuthToken = dbSettings.twilioAuthToken;
      if (dbSettings.twilioFromNumber) twilioFromNumber = dbSettings.twilioFromNumber;
    }
  } catch (err) {
    console.error('Failed to load Twilio settings from database:', err.message);
  }

  if (twilioAccountSid && twilioAuthToken && twilioFromNumber) {
    twilioActive = true;
  }

  if (transporter) {
    try {
      const fromEmail = user || 'support@zomato.com';
      const showMockSms = !twilioActive && phoneOtp;
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
          <h2 style="color: #e23744; text-align: center;">zomato</h2>
          <hr style="border: 0; border-top: 1px solid #e1e1e1;" />
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Your email security verification code is:</p>
          <div style="background-color: #f9f9f9; border: 1px dashed #e23744; border-radius: 6px; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e23744; margin: 20px 0;">
            ${otp}
          </div>
          
          ${showMockSms ? `
            <p style="font-size: 16px; color: #333; margin-top: 25px;">Your mobile security verification code (Test Mode Sandbox) is:</p>
            <div style="background-color: #f9f9f9; border: 1px dashed #cb202d; border-radius: 6px; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #cb202d; margin: 20px 0;">
              ${phoneOtp}
            </div>
            <p style="font-size: 13px; color: #ff9f43; font-style: italic; text-align: center;">💡 This mobile code is displayed here because live Twilio SMS credentials are not configured in your .env file or Settings dashboard.</p>
          ` : ''}
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 20px;">This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #e1e1e1; margin-top: 30px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated email from the zomato engine. Please do not reply.</p>
        </div>
      `;

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: '🔐 Your zomato Security Verification Code',
        text: `Your email code: ${otp} ${showMockSms ? `| Your mobile code: ${phoneOtp}` : ''}`,
        html: htmlBody
      });
      
      console.log(`[EMAIL SENT] Message ID: ${info.messageId} to ${email}`);
      let previewUrl = null;
      if (isEthereal) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('====================================================');
        console.log(`✉️ ETHEREAL MAIL PREVIEW: View sent email online!`);
        console.log(`🔗 URL: ${previewUrl}`);
        console.log('====================================================');
      }
      return { success: true, previewUrl };
    } catch (error) {
      console.error('Error sending Email OTP via SMTP:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Fallback / Sandbox logging
  console.log('====================================================');
  console.log(`📡 SMTP SANDBOX FALLBACK: Email OTP Code`);
  console.log(`📧 Recipient: ${email}`);
  console.log(`🔑 OTP CODE:  [ ${otp} ]`);
  if (phoneOtp) {
    console.log(`📱 MOBILE CODE: [ ${phoneOtp} ]`);
  }
  console.log(`💡 Configure SMTP_HOST in env or database configurations for live email delivery.`);
  console.log('====================================================');
  return { success: false };
};

export const sendSmsOTP = async (phone, otp) => {
  // Load Twilio configurations (try DB first, fallback to process.env)
  let accountSid = process.env.TWILIO_ACCOUNT_SID;
  let authToken = process.env.TWILIO_AUTH_TOKEN;
  let fromNumber = process.env.TWILIO_FROM_NUMBER;

  try {
    const dbSettings = await SettingsModel.get();
    if (dbSettings) {
      if (dbSettings.twilioAccountSid) accountSid = dbSettings.twilioAccountSid;
      if (dbSettings.twilioAuthToken) authToken = dbSettings.twilioAuthToken;
      if (dbSettings.twilioFromNumber) fromNumber = dbSettings.twilioFromNumber;
    }
  } catch (err) {
    console.error('Failed to load Twilio settings from database for SMS:', err.message);
  }

  if (accountSid && authToken && fromNumber) {
    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        body: `Your zomato security verification code is: ${otp}. Valid for 5 minutes.`,
        from: fromNumber,
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
  console.log(`💡 Configure Twilio settings in env or database configurations for live SMS delivery.`);
  console.log('====================================================');
  return false;
};
// Trigger nodemon reload for new .env settings

