import * as Brevo from "@getbrevo/brevo";
import { logger } from "./logger";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY as string,
);

// ----------------------- SEND EMAIL ---------------------------
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
// ----------------------- EMAIL TEMPLATE ---------------------------
export const appointmentConfirmationTemplate = ({
  fullName,
  date,
  startTime,
  endTime,
  serviceName,
  phoneNumber,
  cancelLink,
}: {
  fullName: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  phoneNumber: string;
  cancelLink: string;
}) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Appointment Confirmation</h2>

      <p>Hello <strong>${fullName}</strong>,</p>

      <p>Your appointment has been successfully scheduled. Here are the details:</p>

      <h3>Appointment Details</h3>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Start Time:</strong> ${startTime}</li>
        <li><strong>End Time:</strong> ${endTime}</li>
        <li><strong>Service:</strong> ${serviceName}</li>
      </ul>

      <p>If you need to cancel your appointment, please access this link:</p>
      <p><strong>${cancelLink}</strong></p>

      <p>For other information plese fell free to contact us:</p>
      <p><strong>${phoneNumber}</strong></p>

      <p>Thank you for choosing our DentAppointment!</p>
    </div>
  `;
};
