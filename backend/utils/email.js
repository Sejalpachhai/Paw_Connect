
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // ✅ Dev-friendly: prevents "self-signed certificate" from killing requests
  // Remove this in production if you want strict TLS.
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.log("Email send failed:", err.message);
    // ✅ Do NOT throw — let registration succeed
    return { ok: false, error: err.message };
  }
};
