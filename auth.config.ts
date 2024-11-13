import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user?.hashedPassword) {
          return null
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isCorrectPassword) {
          return null
        }

        return user
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token }) {
      return token
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin"
  }
} satisfies NextAuthConfig 