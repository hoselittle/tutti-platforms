import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Select = forwardRef(({ className, label, error, options, placeholder, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;