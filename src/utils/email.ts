import Brevo from "@getbrevo/brevo";
import { logger } from "./logger";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY as string,
);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const email = {
      sender: { email: process.env.MAIL_FROM || "no-reply@yourapp.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    await apiInstance.sendTransacEmail(email);

    logger.info(`Email sent to ${to}`);
  } catch (err: any) {
    logger.error(`Email sending failed: ${err.message}`);
    throw new Error("Email sending failed");
  }
};
