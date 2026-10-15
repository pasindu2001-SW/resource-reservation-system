'use client';

import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-16 bg-slate-200 rounded-full" />
      </div>
      <div className="h-5 w-40 bg-slate-200 rounded" />
      <div className="flex gap-3">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-200 rounded" />
      </div>
      <div className="h-10 w-full bg-slate-100 rounded" />
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-8 w-20 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-3 flex justify-between items-center border-b border-slate-100 last:border-0">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
          <div className="h-7 w-20 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}