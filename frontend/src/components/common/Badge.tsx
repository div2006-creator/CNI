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
  let styleClasses = 'bg-slate-100 text-slate-600 border-slate-300';

  if (variant === 'risk' || variant === 'severity') {
    switch (typeValue) {
      case 'CRITICAL':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'HIGH':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'MEDIUM':
        styleClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'LOW':
        styleClasses = 'bg-slate-100 text-slate-600 border-slate-300';
        break;
    }
  } else if (variant === 'entity') {
    switch (typeValue) {
      case 'PERSON':
        styleClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
        break;
      case 'ORGANIZATION':
        styleClasses = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'LOCATION':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'ACCOUNT':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'PHONE':
        styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'VEHICLE':
        styleClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'EVENT':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'CASE':
        styleClasses = 'bg-teal-50 text-teal-700 border-teal-200';
        break;
    }
  } else if (variant === 'status') {
    if (typeValue === 'ACTIVE' || typeValue === 'NEW') {
      styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (typeValue === 'UNDER_REVIEW' || typeValue === 'PROCESSING') {
      styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    } else {
      styleClasses = 'bg-slate-100 text-slate-500 border-slate-300';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-mono font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClasses} ${styleClasses}`}>
      {label}
    </span>
  );
};
