import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
  port: Number(process.env.EMAIL_PORT) || 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter
(async () => {
  try {
    await transporter.verify();
    console.log("✅ Email transporter is ready");
    logger.info("Email transporter is ready");
  } catch (error) {
    console.error("❌ Email transporter error:", error);
    logger.error("Email transporter error:", error);
  }
})();

// Simple sendEmail function
type SendEmailOptions = {
  to: string;
  name: string;
};
export const sendEmailForOtp = async (
  options: SendEmailOptions,
  otp: string,
) => {
  const subject = "OTP for password reset";
  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 20px; border:1px solid #ddd; border-radius:10px; background:#f9f9f9;">
        <h2 style="color:#2BB673;">GETMODPC</h2>
        <p>Hello,${options.name},</p>
        <p>We received a request to reset your password. Use the OTP below to reset it:</p>
        <h1 style="text-align:center; color:#2BB673; letter-spacing: 4px;">${otp}</h1>
        <p style="font-size: 0.9em; color: #555;">This OTP is valid for 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr />
        <p style="font-size: 0.8em; color:#888;">&copy; ${new Date().getFullYear()} GETMODPC. All rights reserved.</p>
      </div>
    `;
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject,
    html,
  });
};

export const sendContactUsEmail = async (options: {
  fullName: string;
  email: string;
  message: string;
}) => {
  const subject = "New Contact Us Message – GETMODPC";

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin:auto; padding: 24px; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px;">
    
    <!-- Header -->
    <div style="text-align:center; padding-bottom: 16px; border-bottom:1px solid #e5e7eb;">
      <h2 style="margin:0; color:#2BB673;">GETMODPC</h2>
      <p style="margin:4px 0 0; color:#1F2937; font-size:14px;">
       GETMODPC is a software development company that specializes in building custom software solutions for businesses and individuals.
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 20px 0; color:#1F2937;">
      <p style="font-size:15px;">You have received a new contact request.</p>

      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <tr>
          <td style="padding:8px 0; font-weight:600;">Name</td>
          <td style="padding:8px 0;">${options?.fullName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-weight:600;">Email</td>
          <td style="padding:8px 0;">${options?.email}</td>
        </tr>
      </table>

      <!-- Message -->
      <div style="margin-top:20px; padding:16px; background:#f9fafb; border-left:4px solid #2BB673; border-radius:6px;">
        <p style="margin:0; font-weight:600;">Message</p>
        <p style="margin:8px 0 0; white-space:pre-line;">
          ${options?.message}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e5e7eb; padding-top:16px; text-align:center; font-size:12px; color:#6b7280;">
      <p style="margin:0;">
        &copy; ${new Date().getFullYear()} GETMODPC. All rights reserved.
      </p>
      <p style="margin:4px 0 0;">
        This email was generated from the Contact Us form.
      </p>
    </div>

  </div>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.CONTACT_RECEIVER_EMAIL, // your support/admin email
    subject,
    html,
    replyTo: options.email, // 🔥 reply directly to sender
  });
};
