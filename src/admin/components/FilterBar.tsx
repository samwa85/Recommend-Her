// ============================================================================
// FILTER BAR - Reusable filter component for admin pages
// ============================================================================

import { useState } from 'react';
import { Filter, X, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'search';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  className?: string;
}

// Special value to represent "All" option (cannot be empty string for Radix)
const ALL_VALUE = '__all__';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  className,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = Object.values(values).filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  // Helper to get select value (convert empty string to ALL_VALUE)
  const getSelectValue = (value: string | undefined) => {
    return value || ALL_VALUE;
  };

  // Helper to handle select change (convert ALL_VALUE to empty string)
  const handleSelectChange = (key: string, value: string) => {
    onChange(key, value === ALL_VALUE ? '' : value);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input (always visible) */}
        {filters.find((f) => f.type === 'search') && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={values['search'] || ''}
              onChange={(e) => onChange('search', e.target.value)}
              className="pl-9 h-9"
            />
            {values['search'] && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => onChange('search', '')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        {/* Quick Filters (visible filters) */}
        {filters
          .filter((f) => f.type === 'select' && f.key !== 'status')
          .slice(0, isExpanded ? undefined : 2)
          .map((filter) => (
            <Select
              key={filter.key}
              value={getSelectValue(values[filter.key])}
              onValueChange={(value) => handleSelectChange(filter.key, value)}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All {filter.label}</SelectItem>
                {filter.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

        {/* Status Filter (if present) */}
        {filters.find((f) => f.key === 'status') && (
          <Select
            value={getSelectValue(values['status'])}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Status</SelectItem>
              {filters
                .find((f) => f.key === 'status')
                ?.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        {/* More Filters Button */}
        {filters.filter((f) => f.type === 'select').length > 2 && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? 'Less' : 'More'}
            {hasActiveFilters && !isExpanded && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear All */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-muted-foreground"
            onClick={onClear}
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t">
          {filters
            .filter((f) => f.type === 'select' && f.key !== 'status')
            .slice(2)
            .map((filter) => (
              <Select
                key={filter.key}
                value={getSelectValue(values[filter.key])}
                onValueChange={(value) => handleSelectChange(filter.key, value)}
              >
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All {filter.label}</SelectItem>
                  {filter.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

          {/* Date Range Filters */}
          {filters
            .filter((f) => f.type === 'date')
            .map((filter) => (
              <div key={filter.key} className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder={filter.label}
                  value={values[filter.key] || ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="w-[150px] h-9"
                />
              </div>
            ))}
        </div>
      )}

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(values)
            .filter(([_, value]) => value)
            .map(([key, value]) => {
              const filter = filters.find((f) => f.key === key);
              if (!filter) return null;

              const label =
                filter.type === 'select'
                  ? filter.options?.find((o) => o.value === value)?.label || value
                  : value;

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => onChange(key, '')}
                >
                  {filter.label}: {label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
