"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, Vote, CheckCircle, ArrowRight, UserCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [session, setSession] = useState<any>(null)

  // Fetch session client-side untuk menghindari mismatch animasi
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setSession(data))
  }, [])

  // Tentukan link tujuan
  let dashboardUrl = "/login"
  let buttonText = "Login Sekarang"
  
  if (session?.user) {
    if (session.user.role === "ADMIN") dashboardUrl = "/admin/dashboard"
    else if (session.user.role === "COMMITTEE") dashboardUrl = "/committee/quick-count"
    else dashboardUrl = "/user/dashboard"
    buttonText = "Lanjut ke Dashboard"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 overflow-hidden">
      {/* CONTAINER UTAMA (Split Layout) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >
        
        {/* BAGIAN KIRI: Konten Tata Cara (Animate Masuk dari Kiri) */}
        <motion.div 
          className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tata Cara Voting</h1>
            <p className="text-gray-500">Ikuti 3 langkah mudah berikut untuk memberikan suara Anda.</p>
          </div>

          {/* GRID 3 LANGKAH */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {/* Langkah 1 */}
            <div className="flex flex-col items-center text-center space-y-2 group cursor-default">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">1. Login</h3>
                <p className="text-[10px] text-gray-500 leading-tight mt-1 px-1">
                  Gunakan NISN/NIP sebagai username & password.
                </p>
              </div>
            </div>

            {/* Langkah 2 */}
            <div className="flex flex-col items-center text-center space-y-2 group cursor-default">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">2. Pilih</h3>
                <p className="text-[10px] text-gray-500 leading-tight mt-1 px-1">
                  Pilih kandidat Ketua OSIS & MPK terbaik.
                </p>
              </div>
            </div>

            {/* Langkah 3 */}
            <div className="flex flex-col items-center text-center space-y-2 group cursor-default">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">3. Selesai</h3>
                <p className="text-[10px] text-gray-500 leading-tight mt-1 px-1">
                  Simpan pilihan & logout dari sistem.
                </p>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <Button asChild size="lg" className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
            <Link href={dashboardUrl}>
              {buttonText} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <div className="mt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SMPN 1 Cibalong
          </div>
        </motion.div>

        {/* BAGIAN KANAN: Branding (Sama Persis dengan Login, Animate Masuk dari Kanan) */}
        {/* Menggunakan layoutId agar framer motion mendeteksi ini elemen yang sama dengan halaman login */}
        <motion.div 
          layoutId="branding-section" 
          className="hidden md:flex w-1/2 bg-primary relative flex-col items-center justify-center p-12 text-primary-foreground overflow-hidden"
        >
          {/* Elemen Dekorasi (Static) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-0 left-0 h-full w-20 bg-white" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}></div>
          <div className="absolute bottom-0 right-0 h-full w-20 bg-white/5" style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}></div>

          {/* Konten Branding */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
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
              Selamat datang di sistem pemilihan berbasis digital. Gunakan hak suara Anda dengan bijak.
            </p>
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  )
}