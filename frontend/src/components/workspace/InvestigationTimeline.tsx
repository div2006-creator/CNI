import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Clock, Calendar, ChevronRight, Activity, Filter } from 'lucide-react';

const TIMELINE_EVENTS = [
  { id: 'evt-01', day: 'T-30 Days', date: '2026-01-15', title: 'Vortex Trading Corp Registered', type: 'CORPORATE_FILING', evidenceId: 'ev-002' },
  { id: 'evt-02', day: 'T-20 Days', date: '2026-01-25', title: 'Bank Account #SYN-994 Opened', type: 'BANK_ACCOUNT', evidenceId: 'ev-003' },
  { id: 'evt-03', day: 'T-10 Days', date: '2026-02-05', title: '47 Encrypted VOIP Calls Logged', type: 'CDR', evidenceId: 'ev-004' },
  { id: 'evt-04', day: 'T-10 Days', date: '2026-02-05', title: '$500,000 High-Velocity Wire Transfer', type: 'BANK_WIRE', evidenceId: 'ev-003' },
  { id: 'evt-05', day: 'T-5 Days', date: '2026-02-10', title: 'Co-Location Observed at Warehouse Hub 7', type: 'SURVEILLANCE', evidenceId: 'ev-001' },
];

export const InvestigationTimeline: React.FC = () => {
  const { selectedEventId, selectEvent, selectEvidence } = useInvestigation();
  const [sliderVal, setSliderVal] = useState<number>(30);

  return (
    <div className="h-full bg-dark-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between font-sans text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-intel-cyan" />
          <span className="font-mono font-bold text-slate-100 uppercase text-xs">
            Temporal Investigation Timeline
          </span>
        </div>
        <span className="font-mono text-[10px] text-intel-cyan font-bold">
          Filter Window: Past {sliderVal} Days
        </span>
      </div>

      {/* Interactive Timeline Event Ticks */}
      <div className="py-2 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          {TIMELINE_EVENTS.map((evt) => {
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
                    ? 'bg-dark-850 border-intel-cyan text-slate-100 font-semibold shadow-md'
                    : 'bg-dark-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-intel-cyan font-bold">{evt.day}</span>
                  <span className="text-slate-500">{evt.type}</span>
                </div>
                <div className="font-semibold text-slate-200 text-xs">{evt.title}</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">{evt.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-500">T-30 Days</span>
        <input
          type="range"
          min="1"
          max="30"
          value={sliderVal}
          onChange={(e) => setSliderVal(parseInt(e.target.value))}
          className="flex-1 accent-intel-cyan cursor-pointer"
        />
        <span className="text-[10px] font-mono text-slate-500">Present (T-0)</span>
      </div>
    </div>
  );
};
