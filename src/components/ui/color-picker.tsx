'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Palette } from 'lucide-react'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  disabled?: boolean
}

const predefinedColors = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#6b7280', // gray-500
  '#1f2937', // gray-800
  '#7c3aed', // purple-600
  '#059669', // emerald-600
]

export function ColorPicker({ color, onChange, disabled }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: color }}
            />
            <Palette className="h-3 w-3 text-gray-500" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="space-y-3">
          <h4 className="text-sm font-medium dark:text-gray-200">Escolher cor</h4>
          <div className="grid grid-cols-6 gap-2">
            {predefinedColors.map((presetColor) => (
              <button
                key={presetColor}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  color === presetColor
                    ? 'border-gray-900 dark:border-gray-100'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor)
                  setOpen(false)
                }}
              />
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">Cor personalizada:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}