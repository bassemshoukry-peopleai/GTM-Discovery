import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConsultantNotification({
  consultantEmail,
  consultantName,
  customerName,
  customerEmail,
  sessionId,
  appUrl,
}: {
  consultantEmail: string
  consultantName: string | null
  customerName: string
  customerEmail: string
  sessionId: string
  appUrl: string
}) {
  const resultsUrl = `${appUrl}/results/${sessionId}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: consultantEmail,
    subject: `Discovery complete: ${customerName} has submitted their GTM worksheet`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a18;">
        <div style="margin-bottom: 32px;">
          <img src="${appUrl}/logo.png" alt="Backstory" style="height: 28px;" />
        </div>
        <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 8px;">Discovery worksheet submitted</h1>
        <p style="color: #6b6b67; margin-bottom: 24px;">
          ${customerName} (${customerEmail}) has completed their GTM discovery worksheet.
          Your AI-generated configuration recommendations are ready to review.
        </p>
        <a href="${resultsUrl}" style="display: inline-block; background: #1a1a18; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
          View recommendations →
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #9a9a96;">
          You're receiving this because you created this discovery session.
          <a href="${appUrl}/dashboard" style="color: #6b6b67;">View all sessions</a>
        </p>
      </div>
    `,
  })
}

export async function sendCustomerInvite({
  customerEmail,
  customerName,
  consultantName,
  discoveryLink,
}: {
  customerEmail: string
  customerName: string
  consultantName: string | null
  discoveryLink: string
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: customerEmail,
    subject: 'Complete your People.ai discovery worksheet',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a18;">
        <div style="margin-bottom: 32px;">
          <img src="https://www.people.ai/wp-content/uploads/2023/01/people-ai-logo.svg" alt="People.ai" style="height: 28px;" />
        </div>
        <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 8px;">Hi ${customerName},</h1>
        <p style="color: #6b6b67; margin-bottom: 24px;">
          ${consultantName ? consultantName + ' has' : 'Your People.ai consultant has'} sent you a GTM discovery worksheet to complete.
          It takes about 10 minutes and helps us tailor your People.ai configuration to your team's needs.
        </p>
        <a href="${discoveryLink}" style="display: inline-block; background: #1a1a18; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
          Complete worksheet →
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #9a9a96;">
          If you weren't expecting this email, you can safely ignore it.
        </p>
      </div>
    `,
  })
}

export async function sendCustomerConfirmation({
  customerEmail,
  customerName,
  consultantName,
}: {
  customerEmail: string
  customerName: string
  consultantName: string | null
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: customerEmail,
    subject: 'Thanks for completing the People.ai discovery worksheet',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a18;">
        <div style="margin-bottom: 32px;">
          <img src="https://www.people.ai/wp-content/uploads/2023/01/people-ai-logo.svg" alt="People.ai" style="height: 28px;" />
        </div>
        <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 8px;">Thank you, ${customerName}</h1>
        <p style="color: #6b6b67; margin-bottom: 16px;">
          We've received your GTM discovery worksheet. Your People.ai services consultant
          ${consultantName ? '(' + consultantName + ') ' : ''}will review your responses and reach out with next steps.
        </p>
        <p style="color: #6b6b67; font-size: 14px;">
          If you have any questions in the meantime, reply to this email and we'll be in touch.
        </p>
      </div>
    `,
  })
}
