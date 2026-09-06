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
  let styleClasses = 'bg-[#f0ebd9] text-slate-800 border-[#e2dacd] font-bold';

  if (variant === 'risk' || variant === 'severity') {
    switch (typeValue) {
      case 'CRITICAL':
        styleClasses = 'bg-rose-100 text-rose-800 border-rose-200 font-bold animate-pulse';
        break;
      case 'HIGH':
        styleClasses = 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
        break;
      case 'MEDIUM':
        styleClasses = 'bg-blue-100 text-blue-800 border-blue-200 font-bold';
        break;
      case 'LOW':
        styleClasses = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
        break;
    }
  } else if (variant === 'entity') {
    switch (typeValue) {
      case 'PERSON':
        styleClasses = 'bg-saffron-600/10 text-saffron-700 border-saffron-600/30 font-bold';
        break;
      case 'ORGANIZATION':
        styleClasses = 'bg-purple-100 text-purple-800 border-purple-200 font-bold';
        break;
      case 'LOCATION':
        styleClasses = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
        break;
      case 'ACCOUNT':
        styleClasses = 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
        break;
      case 'PHONE':
        styleClasses = 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold';
        break;
      case 'VEHICLE':
        styleClasses = 'bg-sky-100 text-sky-800 border-sky-200 font-bold';
        break;
      case 'EVENT':
        styleClasses = 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
        break;
      case 'CASE':
        styleClasses = 'bg-teal-100 text-teal-800 border-teal-200 font-bold';
        break;
    }
  } else if (variant === 'status') {
    if (typeValue === 'ACTIVE' || typeValue === 'NEW') {
      styleClasses = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
    } else if (typeValue === 'UNDER_REVIEW' || typeValue === 'PROCESSING') {
      styleClasses = 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
    } else {
      styleClasses = 'bg-[#f0ebd9] text-slate-700 border-[#e2dacd] font-bold';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-mono font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClasses} ${styleClasses}`}>
      {label}
    </span>
  );
};
