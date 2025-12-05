import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi")
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })

        if (!user) {
          throw new Error("Username tidak ditemukan")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Password salah")
        }

        return {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          hasVotedOsis: user.hasVotedOsis,
          hasVotedMpk: user.hasVotedMpk,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.fullName = user.fullName
        token.role = user.role
        token.hasVotedOsis = user.hasVotedOsis
        token.hasVotedMpk = user.hasVotedMpk
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.hasVotedOsis = session.hasVotedOsis ?? token.hasVotedOsis
        token.hasVotedMpk = session.hasVotedMpk ?? token.hasVotedMpk
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.fullName = token.fullName as string
        session.user.role = token.role as string
        session.user.hasVotedOsis = token.hasVotedOsis as boolean
        session.user.hasVotedMpk = token.hasVotedMpk as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
}
