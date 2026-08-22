import React from 'react';
import { RiskLevel, EntityType, AlertSeverity } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'risk' | 'entity' | 'severity' | 'status' | 'default';
  typeValue?: RiskLevel | EntityType | AlertSeverity | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  typeValue,
  size = 'md'
}) => {
  let styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'risk' || variant === 'severity') {
    switch (typeValue) {
      case 'CRITICAL':
        styleClasses = 'bg-rose-950/80 text-rose-300 border-rose-800/80 animate-pulse';
        break;
      case 'HIGH':
        styleClasses = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
        break;
      case 'MEDIUM':
        styleClasses = 'bg-blue-950/80 text-blue-300 border-blue-800/80';
        break;
      case 'LOW':
        styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';
        break;
    }
  } else if (variant === 'entity') {
    switch (typeValue) {
      case 'PERSON':
        styleClasses = 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
        break;
      case 'ORGANIZATION':
        styleClasses = 'bg-purple-950/80 text-purple-300 border-purple-800/80';
        break;
      case 'LOCATION':
        styleClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
        break;
      case 'ACCOUNT':
        styleClasses = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
        break;
      case 'PHONE':
        styleClasses = 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80';
        break;
      case 'VEHICLE':
        styleClasses = 'bg-sky-950/80 text-sky-300 border-sky-800/80';
        break;
      case 'EVENT':
        styleClasses = 'bg-rose-950/80 text-rose-300 border-rose-800/80';
        break;
      case 'CASE':
        styleClasses = 'bg-teal-950/80 text-teal-300 border-teal-800/80';
        break;
    }
  } else if (variant === 'status') {
    if (typeValue === 'ACTIVE' || typeValue === 'NEW') {
      styleClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    } else if (typeValue === 'UNDER_REVIEW' || typeValue === 'PROCESSING') {
      styleClasses = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
    } else {
      styleClasses = 'bg-slate-800 text-slate-400 border-slate-700';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-mono font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClasses} ${styleClasses}`}>
      {label}
    </span>
  );
};
