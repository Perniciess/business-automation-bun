import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const location = useLocation()

  const menuItems = [
    {
      title: "Панель администратора",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Аналитика",
      path: "/dashboard/analytics",
      icon: BarChart3,
    },
  ]

  return (
    <aside className={cn("w-64 bg-background border-r border-border flex flex-col", className)}>
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Меню</h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

