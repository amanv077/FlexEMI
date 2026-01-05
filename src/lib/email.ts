import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
})

export async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text?: string, html?: string }) {
    if (!process.env.EMAIL_SERVER_HOST) {
        console.log("Email server not configured, skipping email:", subject)
        return
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html
        })
        console.log("Email sent:", info.messageId)
        return info
    } catch (error) {
        console.error("Error sending email:", error)
        // Don't throw, just log. We don't want to block main flow.
    }
}
