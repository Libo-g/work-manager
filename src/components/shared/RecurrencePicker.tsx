'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RecurrenceType } from '@/lib/types';
import { RECURRENCE_LABELS, RECURRENCE_REMINDER_DAYS } from '@/lib/types';

interface RecurrencePickerProps {
  value: RecurrenceType | null;
  onChange: (value: RecurrenceType | null) => void;
}

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
  const options: RecurrenceType[] = ['monthly', 'quarterly', 'semi_annual', 'annual'];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>任务类型</Label>
        <div className="flex rounded-md border border-zinc-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`px-3 py-1.5 transition-colors ${
              value === null ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            单次
          </button>
          <button
            type="button"
            onClick={() => onChange(options[0])}
            className={`px-3 py-1.5 transition-colors ${
              value !== null ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            周期
          </button>
        </div>
      </div>

      {value !== null && (
        <div className="space-y-2 pl-0">
          <Select
            value={value}
            onValueChange={(v) => onChange(v as RecurrenceType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{RECURRENCE_LABELS[value]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((type) => (
                <SelectItem key={type} value={type}>
                  {RECURRENCE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-400">
            截止前 {RECURRENCE_REMINDER_DAYS[value]} 天提醒
          </p>
        </div>
      )}
    </div>
  );
}
