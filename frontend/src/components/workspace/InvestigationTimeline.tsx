import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Clock } from 'lucide-react';

export const InvestigationTimeline: React.FC = () => {
  const { selectedEventId, selectEvent, selectEvidence } = useInvestigation();
  const [sliderVal, setSliderVal] = useState<number>(30);

  const timelineEvents: any[] = [];

  return (
    <div className="h-full bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl p-3 flex flex-col justify-between font-sans text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-saffron-600" />
          <span className="font-mono font-bold text-stone-900 uppercase text-xs">
            Temporal Investigation Timeline
          </span>
        </div>
        <span className="font-mono text-[10px] text-saffron-700 font-bold">
          Filter Window: Past {sliderVal} Days
        </span>
      </div>

      {/* Interactive Timeline Event Ticks */}
      <div className="py-2 overflow-x-auto">
        {timelineEvents.length > 0 ? (
          <div className="flex items-center gap-3 min-w-max">
            {timelineEvents.map((evt) => {
              const isSelected = selectedEventId === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => {
                    selectEvent(evt.id);
                    if (evt.evidenceId) selectEvidence(evt.evidenceId);
                  }}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-saffron-50 border-saffron-400 text-stone-900 font-semibold shadow-sm'
                      : 'bg-white border-[#e5dfd3] hover:border-saffron-300 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1 gap-2">
                    <span className="text-saffron-700 font-bold">{evt.day}</span>
                    <span className="text-stone-500">{evt.type}</span>
                  </div>
                  <div className="font-semibold text-stone-900 text-xs">{evt.title}</div>
                  <div className="text-[9px] font-mono text-stone-500 mt-1">{evt.date}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-2 text-stone-500 font-mono text-[11px]">
            No temporal events recorded for active case window.
          </div>
        )}
      </div>

      {/* Time Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-stone-500">T-30 Days</span>
        <input
          type="range"
          min="1"
          max="30"
          value={sliderVal}
          onChange={(e) => setSliderVal(parseInt(e.target.value))}
          className="flex-1 accent-saffron-600 cursor-pointer"
        />
        <span className="text-[10px] font-mono text-stone-500">Present (T-0)</span>
      </div>
    </div>
  );
};
