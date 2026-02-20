import { PrismaClient } from "@prisma/client"
import { randomBytes } from "crypto"
import { Resend } from "resend"

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ message: "If email exists, reset link sent" })
    }

    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: { email, token, expires }
    })

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      html: `
      <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:40px 20px;">
        <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          
          <div style="text-align:center; margin-bottom:24px;">
            <h2 style="margin:0; color:#111827;">Reset Your Password</h2>
            <p style="color:#6b7280; font-size:14px; margin-top:8px;">
              We received a request to reset your password.
            </p>
          </div>
    
          <div style="text-align:center; margin:32px 0;">
            <a href="${resetLink}" 
               style="background:#2563eb; color:#ffffff; padding:14px 28px; 
                      text-decoration:none; border-radius:8px; font-weight:600; 
                      display:inline-block;">
              Reset Password
            </a>
          </div>
    
          <p style="color:#6b7280; font-size:14px; line-height:1.6;">
            This link will expire in <strong>15 minutes</strong>.
          </p>
    
          <p style="color:#9ca3af; font-size:12px; margin-top:24px;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
    
          <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;" />
    
          <p style="font-size:12px; color:#9ca3af; text-align:center;">
            © ${new Date().getFullYear()} Invoice Manager. All rights reserved.
          </p>
    
        </div>
      </div>
      `
    })
    
    

    return Response.json({ message: "Reset email sent" })
  } catch (error) {
    console.error(error)
    return new Response("Server error", { status: 500 })
  }
}
