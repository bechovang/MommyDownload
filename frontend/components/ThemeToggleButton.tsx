"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-20 w-20 bg-slate-100 dark:bg-slate-700 shadow-xl border-4 border-blue-300 dark:border-blue-600"
        aria-label="Chuyển đổi chế độ sáng/tối"
      >
        {/* No icon rendered on server or before hydration */}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full h-20 w-20 bg-slate-100 dark:bg-slate-700 shadow-xl border-4 border-blue-300 dark:border-blue-600"
      onClick={toggleTheme}
    >
      {theme === "dark" ? <Sun className="h-15 w-15 text-yellow-500" /> : <Moon className="h-15 w-15 text-blue-700" />}
      <span className="sr-only">Chuyển đổi chế độ sáng/tối</span>
    </Button>
  )
} 