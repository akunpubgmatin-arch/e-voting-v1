"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function CommitteeSettingsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Style untuk inner card (Flat)
  const innerCardStyle = "bg-white border-gray-200 shadow-none"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Password baru tidak cocok")
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password minimal 6 karakter")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengubah password")
      }

      toast.success("Password berhasil diubah")
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Panitia", href: "/committee" }, { label: "Pengaturan" }]} />
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            
            {/* CONTAINER INDUK PUTIH */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              
              <div className="pb-2">
                <PageHeader title="Pengaturan" description="Kelola pengaturan akun Anda" />
              </div>

              <Separator />

              {/* PERUBAHAN DISINI: 
                  Hapus 'max-w-2xl'
                  Ganti jadi 'grid gap-6 md:grid-cols-2' agar layoutnya menyamping
              */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Account Info */}
                <Card className={`${innerCardStyle} h-fit`}>
                  <CardHeader>
                    <CardTitle>Informasi Akun</CardTitle>
                    <CardDescription>Detail akun Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        {/* Input Readonly diberi bg-gray-50 agar terlihat beda dengan editable */}
                        <Input value={session?.user?.username || ""} disabled className="bg-gray-50 text-gray-500 border-gray-200" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <Input value={session?.user?.fullName || ""} disabled className="bg-gray-50 text-gray-500 border-gray-200" />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <div>
                          <Badge>{session?.user?.role === "ADMIN" ? "Administrator" : "Panitia"}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card className={innerCardStyle}>
                  <CardHeader>
                    <CardTitle>Ubah Password</CardTitle>
                    <CardDescription>Pastikan password baru Anda aman dan mudah diingat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Password Saat Ini</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          required
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Password Baru</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          required
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          required
                          className="bg-white"
                        />
                      </div>
                      <div className="pt-2">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Ubah Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
            {/* END CONTAINER INDUK */}

          </div>
        </div>
      </div>
    </>
  )
}