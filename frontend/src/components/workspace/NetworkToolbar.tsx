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
    <div className="flex items-center justify-between p-2 bg-[#fcfcf9] border border-[#e5dfd3] rounded-lg shadow-sm">
      {/* Layout selector */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-stone-600 font-mono px-2">Layout:</span>
        {(['cose', 'concentric', 'circle', 'grid'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLayoutName(l)}
            className={`px-2 py-0.5 text-[11px] font-mono rounded capitalize transition-all ${
              layoutName === l
                ? 'bg-saffron-50 text-saffron-700 font-bold border border-saffron-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-1">
        <button onClick={onZoomIn} title="Zoom In" className="p-1 text-stone-600 hover:text-stone-900 hover:bg-[#f3efe6] rounded">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={onZoomOut} title="Zoom Out" className="p-1 text-stone-600 hover:text-stone-900 hover:bg-[#f3efe6] rounded">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={onFit} title="Fit Graph to View" className="p-1 text-stone-600 hover:text-stone-900 hover:bg-[#f3efe6] rounded">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onReset} title="Reset Camera" className="p-1 text-stone-600 hover:text-stone-900 hover:bg-[#f3efe6] rounded">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
