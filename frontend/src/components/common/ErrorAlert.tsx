import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'System Endpoint Warning',
  message = 'Failed to sync with intelligence backend server. Using local synthetic fallback data.',
  onRetry
}) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h5 className="text-sm font-semibold text-amber-800">{title}</h5>
        <p className="text-xs text-amber-700 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-mono rounded-lg transition-colors border border-amber-300"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
};
