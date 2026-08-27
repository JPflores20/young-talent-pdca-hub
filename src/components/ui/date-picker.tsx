import * as React from "react"
import { format, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  dateFormat?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Seleccionar fecha",
  className,
  dateFormat = "dd/MM/yyyy",
  disabled = false,
}: DatePickerProps) {
  const isValidDate = date instanceof Date && isValid(date);

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          disabled={disabled}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal truncate",
            !isValidDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {isValidDate ? format(date, dateFormat, { locale: es }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? date : undefined}
          onSelect={setDate}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
