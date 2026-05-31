'use client';
import React from 'react';

const Pulse = ({ className = '' }) => (
  <div className={`animate-pulse-soft bg-gray-200 rounded ${className}`} aria-hidden="true" />
);

export const InternshipCardSkeleton = () => (
  <div className="bg-white rounded border border-[#E2E5E8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-shadow duration-200 rounded-lg p-5 space-y-3" aria-busy="true">
    <div className="flex justify-between items-start gap-3">
      <div className="space-y-2 flex-1">
        <Pulse className="h-5 w-3/4" />
        <Pulse className="h-3.5 w-1/3" />
      </div>
      <Pulse className="w-14 h-10 flex-shrink-0" />
    </div>
    <div className="flex gap-5">
      <Pulse className="h-3.5 w-24" />
      <Pulse className="h-3.5 w-28" />
      <Pulse className="h-3.5 w-20" />
    </div>
    <div className="flex gap-2">
      <Pulse className="h-5 w-20 rounded-full" />
      <Pulse className="h-5 w-24 rounded-full" />
    </div>
    <div className="flex justify-between items-center pt-1 border-t border-[#E2E5E8]">
      <Pulse className="h-3.5 w-24" />
      <Pulse className="h-7 w-24 rounded-full" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="space-y-3" role="status" aria-label="Loading internships">
    {Array.from({ length: count }, (_, i) => <InternshipCardSkeleton key={i} />)}
    <span className="sr-only">Loading…</span>
  </div>
);
