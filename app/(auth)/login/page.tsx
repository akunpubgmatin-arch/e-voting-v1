"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Loader2, AlertCircle, Eye, EyeOff, User, Lock, CheckCircle2, XCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isErrorOpen, setIsErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setErrorMessage("Username atau password yang Anda masukkan salah.")
        setIsErrorOpen(true)
        setIsLoading(false)
        return
      }

      setIsSuccessOpen(true)

      const response = await fetch("/api/auth/session")
      const session = await response.json()

      setTimeout(() => {
        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard")
        } else if (session?.user?.role === "COMMITTEE") {
          router.push("/committee/quick-count")
        } else {
          router.push("/user/dashboard")
        }
      }, 1500)

    } catch {
      setErrorMessage("Terjadi kesalahan jaringan.")
      setIsErrorOpen(true)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 overflow-hidden">
      {/* CONTAINER UTAMA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >
        
        {/* BAGIAN KIRI: Branding & Visual (Sekarang di Kiri) */}
        <motion.div 
          layoutId="branding-section"
          className="hidden md:flex w-1/2 bg-primary relative flex-col items-center justify-center p-12 text-primary-foreground overflow-hidden"
        >
          {/* Elemen Dekorasi */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          {/* Clip Path (Dibalik agar cocok di sisi kiri) */}
          <div className="absolute top-0 right-0 h-full w-20 bg-white/5" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}></div>
          <div className="absolute bottom-0 left-0 h-full w-20 bg-white/10" style={{ clipPath: "polygon(0 100%, 100% 100%, 0 0)" }}></div>

          {/* Konten Branding */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/20 shadow-2xl mb-8">
              <img 
                src="/logo-e-voting.png" 
                alt="Logo E-Voting" 
                className="h-32 w-auto object-contain drop-shadow-md"
              />
            </div>
            
            <h2 className="text-3xl font-bold mb-2">E-Voting OSIS & MPK</h2>
            <p className="text-lg font-medium text-primary-foreground/80 tracking-wide">
              SMP NEGERI 1 CIBALONG
            </p>
            
            <div className="mt-8 w-24 h-1 bg-white/30 rounded-full"></div>
            
            <p className="mt-8 text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
              Wujudkan demokrasi sekolah yang jujur, adil, dan transparan melalui pemilihan berbasis teknologi.
            </p>
          </motion.div>
        </motion.div>

        {/* BAGIAN KANAN: Form Login (Sekarang di Kanan) */}
        <motion.div 
          className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
            <p className="text-gray-500">Silakan masuk untuk menggunakan hak pilih Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">Username</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="NIS / NIP"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="username"
                  className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  className="h-12 pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all mt-4 bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </div>
              ) : (
                "Masuk Sekarang"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SMPN 1 Cibalong
          </div>
        </motion.div>

      </motion.div>

      {/* Modal Sukses & Gagal */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-green-700">Login Berhasil!</DialogTitle>
              <DialogDescription className="text-center text-gray-500 text-base">
                Selamat datang kembali. Anda akan dialihkan ke dashboard...
              </DialogDescription>
            </DialogHeader>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-green-500 animate-[progress_1.5s_ease-in-out_forwards] w-0" style={{ width: '100%' }}></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-2 animate-in shake duration-300">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center text-red-700">Login Gagal</DialogTitle>
              <DialogDescription className="text-center text-gray-600 text-base">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 mt-4" 
              onClick={() => setIsErrorOpen(false)}
            >
              Coba Lagi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}