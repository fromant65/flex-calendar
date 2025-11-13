"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { ArrowUpDown, Check } from "lucide-react"
import type { SortOption } from "~/types/filters"
import { sortLabels, sortLabelsLong, sortOptions } from "~/types/filters"

interface SortDropdownProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

export function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 text-xs w-full sm:w-auto justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ArrowUpDown className="h-4 w-4 shrink-0" />
            <span className="truncate">{sortLabels[currentSort]}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onSortChange(option)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{sortLabelsLong[option]}</span>
            {currentSort === option && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
