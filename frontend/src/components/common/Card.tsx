import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  hoverEffect = false,
}) => {
  return (
    <div className={`intel-card ${hoverEffect ? 'intel-card-hover' : ''} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div>
            {title && <h3 className="text-base font-bold text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
