import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"

export default async function HomePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Redirect based on role
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard")
  } else if (session.user.role === "COMMITTEE") {
    redirect("/committee/quick-count")
  } else {
    redirect("/user/dashboard")
  }
}
