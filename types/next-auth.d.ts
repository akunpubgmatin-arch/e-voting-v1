import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      fullName: string
      role: string
      hasVotedOsis: boolean
      hasVotedMpk: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    username: string
    fullName: string
    role: string
    hasVotedOsis: boolean
    hasVotedMpk: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    username: string
    fullName: string
    role: string
    hasVotedOsis: boolean
    hasVotedMpk: boolean
  }
}
