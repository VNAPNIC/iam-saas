"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
        <i className="fas fa-moon text-gray-500 dark:text-gray-400"></i>
      </button>
    )
  }

  // Template-style dark mode toggle
  const toggleDarkMode = () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    setTheme(isDarkMode ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="w-9 h-9 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
    >
      {theme === "dark" ? (
        <i className="fas fa-sun text-gray-500 dark:text-gray-400"></i>
      ) : (
        <i className="fas fa-moon text-gray-500 dark:text-gray-400"></i>
      )}
    </button>
  )
}