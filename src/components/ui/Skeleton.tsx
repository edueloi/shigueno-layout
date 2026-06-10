import React from 'react';

/**
 * Skeleton loaders padrão — shimmer suave enquanto os dados carregam.
 */
export default function Skeleton({ className = '' }: { className?: string; [key: string]: any }) {
  return <div className={`animate-shimmer rounded-xl bg-slate-200/70 ${className}`} />;
}

/** Grade de cards fantasma para telas de dashboard. */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-24 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

/** Linhas fantasma para tabelas/listas. */
export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );
}
