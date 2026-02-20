import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken || resetToken.expires < new Date()) {
      return new Response("Invalid or expired token", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    })

    await prisma.passwordResetToken.delete({
      where: { token }
    })

    return Response.json({ message: "Password updated" })
  } catch (error) {
    console.error(error)
    return new Response("Server error", { status: 500 })
  }
}
