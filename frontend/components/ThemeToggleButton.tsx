"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-20 w-20 bg-slate-100 dark:bg-slate-700 shadow-xl border-4 border-blue-300 dark:border-blue-600"
        onClick={toggleTheme}
      >
        {theme === "dark" ? <Sun className="h-15 w-15 text-yellow-500" /> : <Moon className="h-15 w-15 text-blue-700" />}
        <span className="sr-only">Chuyển đổi chế độ sáng/tối</span>
      </Button>
    </div>
  )
} 