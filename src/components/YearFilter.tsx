import React from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface YearFilterProps {
  selectedYear: number | null;
  availableYears: number[];
  onYearChange: (year: number | null) => void;
  showAll?: boolean;
}

export function YearFilter({ selectedYear, availableYears, onYearChange, showAll = true }: YearFilterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {showAll && (
        <Button
          variant={selectedYear === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onYearChange(null)}
        >
          Todas
        </Button>
      )}
      {availableYears
        .sort((a, b) => b - a)
        .map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? 'default' : 'outline'}
            size="sm"
            onClick={() => onYearChange(year)}
          >
            {year}
            {year === currentYear && ' (Actual)'}
          </Button>
        ))}
    </div>
  );
}
