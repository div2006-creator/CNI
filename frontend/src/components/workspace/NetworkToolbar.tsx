import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Sliders } from 'lucide-react';

interface NetworkToolbarProps {
  layoutName: string;
  setLayoutName: (name: 'cose' | 'concentric' | 'circle' | 'grid') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
}

export const NetworkToolbar: React.FC<NetworkToolbarProps> = ({
  layoutName,
  setLayoutName,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset
}) => {
  return (
    <div className="flex items-center justify-between p-2 bg-dark-900/90 border border-slate-800 rounded-lg backdrop-blur-md">
      {/* Layout selector */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-slate-400 font-mono px-2">Layout:</span>
        {(['cose', 'concentric', 'circle', 'grid'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLayoutName(l)}
            className={`px-2 py-0.5 text-[11px] font-mono rounded capitalize transition-all ${
              layoutName === l
                ? 'bg-intel-cyan/20 text-intel-cyan font-bold border border-intel-cyan/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-1">
        <button onClick={onZoomIn} title="Zoom In" className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={onZoomOut} title="Zoom Out" className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={onFit} title="Fit Graph to View" className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onReset} title="Reset Camera" className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
