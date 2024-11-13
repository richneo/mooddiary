import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

const config: NextAuthOptions = {
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
    async session({ session, token }: { session: Session; token: JWT }) {
      return session
    },
    async jwt({ token }: { token: JWT }) {
      return token
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin"
  }
}

const handler = NextAuth(config)

export const GET = handler
export const POST = handler 