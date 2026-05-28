import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM);
}

export async function sendLoginOtp(email: string, code: string) {
  if (!hasSmtpConfig()) {
    logger.info("Email OTP generated", { email, code });
    return { delivered: false, channel: "console" as const };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Your PocketPilot login code",
    text: `Your PocketPilot login code is ${code}. It expires in ${env.OTP_EXPIRES_IN_MINUTES} minutes.`,
    html: `<p>Your PocketPilot login code is <strong>${code}</strong>.</p><p>It expires in ${env.OTP_EXPIRES_IN_MINUTES} minutes.</p>`,
  });

  return { delivered: true, channel: "email" as const };
}
