"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Vote,
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Play,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
  FileText,
  UserCircle,
} from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Periode",
    url: "/admin/periode",
    icon: Calendar,
  },
  {
    title: "Kandidat",
    url: "/admin/kandidat",
    icon: UserCircle,
  },
  {
    title: "Data Pemilih",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Administrator",
    url: "/admin/administrator",
    icon: UserCog,
  },
  {
    title: "Kontrol Voting",
    url: "/admin/voting-control",
    icon: Play,
  },
  {
    title: "Quick Count",
    url: "/admin/quick-count",
    icon: BarChart3,
  },
]

const userNavItems = [
  {
    title: "Dashboard",
    url: "/user/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Vote",
    url: "/user/vote",
    icon: Vote,
  },
  {
    title: "Pengaturan",
    url: "/user/settings",
    icon: Settings,
  },
]

const committeeNavItems = [
  {
    title: "Quick Count",
    url: "/committee/quick-count",
    icon: BarChart3,
  },
  {
    title: "Laporan",
    url: "/committee/reports",
    icon: FileText,
  },
  {
    title: "Pengaturan",
    url: "/committee/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const getNavItems = () => {
    switch (session?.user?.role) {
      case "ADMIN":
        return adminNavItems
      case "COMMITTEE":
        return committeeNavItems
      default:
        return userNavItems
    }
  }

  const navItems = getNavItems()

  const getRoleLabel = () => {
    switch (session?.user?.role) {
      case "ADMIN":
        return "Administrator"
      case "COMMITTEE":
        return "Panitia"
      case "TEACHER":
        return "Guru"
      default:
        return "Pemilih"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent hover:text-sidebar-primary">
              <Link href="/" className="flex items-center gap-3">
                {/* LOGO SEKOLAH */}
                {/* Pastikan file logo.png sudah ada di folder /public */}
                <div className="flex aspect-square size-10 items-center justify-center">
                  <img 
                    src="/logo-sekolah-smpn-cibalong.png" 
                    alt="Logo SMPN 1 Cibalong" 
                    className="size-full object-contain"
                  />
                </div>
                
                {/* TEKS IDENTITAS */}
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-base">SMPN 1 Cibalong</span>
                  <span className="text-xs text-muted-foreground font-medium">E-Voting OSIS & MPK</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                      {session?.user?.fullName ? getInitials(session.user.fullName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="truncate font-semibold text-sm">{session?.user?.fullName || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">{getRoleLabel()}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                      {session?.user?.fullName ? getInitials(session.user.fullName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="truncate font-semibold text-sm">{session?.user?.fullName || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">@{session?.user?.username}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
