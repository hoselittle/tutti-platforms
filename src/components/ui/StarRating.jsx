'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({
  rating = 0,
  maxRating = 5,
  size = 16,
  interactive = false,
  onRate,
  className,
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            'transition-colors',
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-zinc-200 text-zinc-200',
            interactive && 'cursor-pointer hover:fill-yellow-300 hover:text-yellow-300'
          )}
          onClick={() => interactive && onRate?.(i + 1)}
        />
      ))}
    </div>
  );
}