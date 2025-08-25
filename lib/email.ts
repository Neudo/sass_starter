import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/transactional/welcome";
import { ResetPasswordEmail } from "@/emails/supabase/reset-password";
import { ConfirmSignupEmail } from "@/emails/supabase/confirm-signup";
import { TrialEndingEmail } from "@/emails/promotional/trial-ending";
import { FeatureRequestConfirmationEmail } from "@/emails/transactional/feature-request-confirmation";
import { FeatureRequestNotificationEmail } from "@/emails/transactional/feature-request-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Hector Analytics <noreply@hectoranalytics.com>";

export interface EmailOptions {
  to: string | string[];
  replyTo?: string;
}

export async function sendWelcomeEmail(
  options: EmailOptions & {
    userName?: string;
    dashboardUrl?: string;
  }
) {
  const { to, userName, dashboardUrl, replyTo } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: replyTo || "support@hectoranalytics.com",
      subject: "Welcome to Hector Analytics - Let's get started",
      react: WelcomeEmail({
        userEmail: Array.isArray(to) ? to[0] : to,
        userName,
        dashboardUrl,
      }),
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  options: EmailOptions & {
    resetUrl: string;
    userName?: string;
  }
) {
  const { to, resetUrl, userName, replyTo } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: replyTo || "support@hectoranalytics.com",
      subject: "Reset your Hector Analytics password",
      react: ResetPasswordEmail({
        resetUrl,
        userName,
        userEmail: Array.isArray(to) ? to[0] : to,
      }),
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export async function sendEmailConfirmation(
  options: EmailOptions & {
    confirmationUrl: string;
    userName?: string;
  }
) {
  const { to, confirmationUrl, userName, replyTo } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: replyTo || "noreply@hectoranalytics.com",
      subject: "Confirm your Hector Analytics account",
      react: ConfirmSignupEmail({
        confirmationUrl,
        userName,
      }),
    });

    if (error) {
      console.error("Failed to send confirmation email:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
}

export async function sendTrialEndingEmail(
  options: EmailOptions & {
    userName?: string;
    daysRemaining: number;
    upgradeUrl?: string;
  }
) {
  const { to, userName, daysRemaining, upgradeUrl, replyTo } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: replyTo || "support@hectoranalytics.com",
      subject: `Your Hector Analytics trial ends in ${daysRemaining} days`,
      react: TrialEndingEmail({
        userName,
        daysRemaining,
        upgradeUrl:
          upgradeUrl || "https://app.hectoranalytics.com/settings/billing",
      }),
    });

    if (error) {
      console.error("Failed to send trial ending email:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending trial ending email:", error);
    throw error;
  }
}

export async function sendFeatureRequestConfirmationEmail(
  options: EmailOptions & {
    userName?: string;
    subject: string;
    message: string;
  }
) {
  const { to, userName, subject, message, replyTo } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: replyTo || "support@hectoranalytics.com",
      subject: "Your feature request has been received",
      react: FeatureRequestConfirmationEmail({
        userEmail: Array.isArray(to) ? to[0] : to,
        userName,
        subject,
        message,
      }),
    });

    if (error) {
      console.error("Failed to send feature request confirmation email:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending feature request confirmation email:", error);
    throw error;
  }
}

export async function sendFeatureRequestNotificationEmail(
  options: {
    userEmail: string;
    userName?: string;
    subject: string;
    message: string;
  }
) {
  const { userEmail, userName, subject, message } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: "support@hectoranalytics.com",
      replyTo: userEmail,
      subject: `Feature Request: ${subject}`,
      react: FeatureRequestNotificationEmail({
        userEmail,
        userName,
        subject,
        message,
      }),
    });

    if (error) {
      console.error("Failed to send feature request notification email:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending feature request notification email:", error);
    throw error;
  }
}

export async function sendBatchEmail(
  emails: Array<{
    to: string | string[];
    subject: string;
    react: React.ReactElement;
    replyTo?: string;
  }>
) {
  try {
    const batch = emails.map((email) => ({
      from: FROM_EMAIL,
      ...email,
      replyTo: email.replyTo || "support@hectoranalytics.com",
    }));

    const { data, error } = await resend.batch.send(batch);

    if (error) {
      console.error("Failed to send batch emails:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending batch emails:", error);
    throw error;
  }
}

export { resend };
