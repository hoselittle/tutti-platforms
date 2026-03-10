'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card, { CardContent } from '@/components/ui/Card';
import { SIGHT_READING_LABELS } from '@/lib/constants';
import { SlidersHorizontal, X } from 'lucide-react';

export default function SearchFilters({ currentFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    postcode: currentFilters.postcode || '',
    ameb: currentFilters.ameb || '',
    hsc: currentFilters.hsc || '',
    min_rate: currentFilters.min_rate || '',
    max_rate: currentFilters.max_rate || '',
    min_rating: currentFilters.min_rating || '',
    sight_reading: currentFilters.sight_reading || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : '') : value,
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      postcode: '',
      ameb: '',
      hsc: '',
      min_rate: '',
      max_rate: '',
      min_rating: '',
      sight_reading: '',
    });
    router.push('/search');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Location */}
          <Input
            label="Postcode"
            name="postcode"
            placeholder="e.g. 2000"
            value={filters.postcode}
            onChange={handleChange}
          />

          {/* Experience Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Experience
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="ameb"
                  checked={filters.ameb === 'true'}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                />
                <span className="text-sm text-zinc-700">AMEB experience</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hsc"
                  checked={filters.hsc === 'true'}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                />
                <span className="text-sm text-zinc-700">HSC experience</span>
              </label>
            </div>
          </div>

          {/* Rate Range */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Hourly Rate (AUD)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="min_rate"
                type="number"
                placeholder="Min"
                value={filters.min_rate}
                onChange={handleChange}
              />
              <Input
                name="max_rate"
                type="number"
                placeholder="Max"
                value={filters.max_rate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Sight Reading */}
          <Select
            label="Min. Sight-Reading"
            name="sight_reading"
            value={filters.sight_reading}
            onChange={handleChange}
            placeholder="Any level"
            options={Object.entries(SIGHT_READING_LABELS).map(
              ([value, label]) => ({
                value,
                label: `${value} — ${label}`,
              })
            )}
          />

          {/* Minimum Rating */}
          <Select
            label="Minimum Rating"
            name="min_rating"
            value={filters.min_rating}
            onChange={handleChange}
            placeholder="Any rating"
            options={[
              { value: '4', label: '4+ Stars' },
              { value: '3', label: '3+ Stars' },
              { value: '2', label: '2+ Stars' },
            ]}
          />

          {/* Apply Button */}
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}