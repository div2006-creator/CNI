import React from 'react';
import { Database, SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'No matching entities or intelligence relationships were returned for the selected filter parameters.',
  action,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-dark-900/50">
      <div className="p-3 bg-dark-850 border border-slate-800 rounded-full text-slate-400 mb-4">
        {icon || <SearchX className="w-8 h-8 text-slate-400" />}
      </div>
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
