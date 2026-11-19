'use client';

import { Eye, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useVisitCount } from '@/context/VisitContext';

export default function VisitCounter({ variant = 'default' }) {
  const { t } = useLanguage();
  const { views, loading } = useVisitCount();

  const formattedViews = views !== null ? views.toLocaleString() : '...';
  const labelText = t('visitCounter', 'label');
  const suffixText = t('visitCounter', 'suffix');

  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-sm backdrop-blur-md">
        <Eye className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>{loading ? '...' : `${formattedViews} ${suffixText}`}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="px-2.5 py-1.5 rounded-xl border theme-border theme-bg-card text-xs font-mono font-bold theme-text-primary flex items-center gap-1.5 shadow-sm">
        <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{loading ? '...' : `${formattedViews}`}</span>
      </div>
    );
  }

  // Default Prominent Badge
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl theme-bg-card border theme-border shadow-md">
      <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Users className="w-4 h-4" />
      </div>
      <div className="text-left font-mono">
        <p className="text-[10px] theme-text-secondary uppercase tracking-wider font-semibold">
          {labelText}
        </p>
        <p className="text-sm font-bold text-amber-400 leading-tight">
          {loading ? '...' : `${formattedViews} ${suffixText}`}
        </p>
      </div>
    </div>
  );
}
