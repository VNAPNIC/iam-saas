"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <select 
      value={i18n.language} 
      onChange={handleLanguageChange}
      className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
    >
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
  )
}