import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { apiService } from '../services/api';
import { NetworkGraphData } from '../types';
import { Clock, Calendar, Play, Pause, RotateCcw, Filter, ArrowRight } from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function loadTemporalGraph() {
      setLoading(true);
      try {
        const data = await apiService.getTemporalGraph();
        setGraphData(data);
      } catch (err) {
        console.error('Temporal graph error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTemporalGraph();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedDay((prev) => (prev >= 30 ? 1 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (loading && !graphData) return <LoadingSpinner message="Reconstructing temporal network states..." />;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Clock className="w-7 h-7 text-intel-cyan" /> Temporal Network Analysis & Time Machine
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            Track how relationships emerged, evolved, or dissolved over time across surveillance logs and CDR telemetry.
          </p>
        </div>

        {/* Play / Pause Controls */}
        <div className="flex items-center gap-3 bg-dark-900/90 border border-slate-800/80 p-2 rounded-2xl font-mono text-xs shadow-md">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-intel-cyan text-dark-950 font-bold rounded-xl hover:bg-cyan-300 transition-all shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause Replay' : 'Play Network Timeline'}
          </button>
          <button
            onClick={() => { setSelectedDay(30); setIsPlaying(false); }}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-dark-850 rounded-xl transition-all"
            title="Reset Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Controls Card */}
      <Card className="border-intel-cyan/40 bg-dark-900/90">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs md:text-sm font-mono">
            <span className="text-slate-300 flex items-center gap-2 font-bold">
              <Calendar className="w-4 h-4 text-intel-cyan" /> Temporal Window Slider
            </span>
            <span className="text-intel-cyan font-bold bg-intel-cyan/10 px-3 py-1 rounded-lg border border-intel-cyan/30">
              Active Graph State at T - {30 - selectedDay} Days
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="30"
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            className="w-full accent-intel-cyan cursor-pointer h-2 bg-dark-950 rounded-lg border border-slate-800"
          />

          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>T-30 Days (Offshore Co Formed)</span>
            <span>T-10 Days (Wire Transfer & Call Burst)</span>
            <span>Present (T-0)</span>
          </div>
        </div>
      </Card>

      {/* Graph & Event Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {graphData && <CytoscapeGraph graphData={graphData} height="540px" />}
        </div>

        {/* Timeline Event Feed */}
        <Card title="Temporal Event Log Stream" subtitle="Chronological event occurrences driving network changes.">
          <div className="space-y-3.5">
            {[
              { time: 'T-30 Days', title: 'Vortex Trading Corp Incorporated', type: 'CORPORATE_FILING', desc: 'Subject Alpha registered shell entity in offshore commercial registry.' },
              { time: 'T-10 Days', title: 'Encrypted VOIP Burst Call Logged', type: 'CDR', desc: '47 short duration calls recorded between Burner #1 and Burner #2.' },
              { time: 'T-10 Days', title: '$500,000 Layered Wire Transfer', type: 'BANK_WIRE', desc: 'High-velocity transaction executed to Crypto Mixer Wallet.' },
              { time: 'T-5 Days', title: 'Co-Location Observed at Warehouse Hub 7', type: 'SURVEILLANCE', desc: 'Subject Bravo and Subject Charlie observed meeting at sector staging site.' },
            ].map((ev, i) => (
              <div key={i} className="p-4 bg-dark-950/90 border border-slate-800/80 rounded-xl space-y-1.5 transition-all hover:border-slate-700/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-intel-cyan font-bold bg-intel-cyan/10 px-2 py-0.5 rounded border border-intel-cyan/30">{ev.time}</span>
                  <span className="text-slate-400 bg-dark-900 px-2 py-0.5 rounded border border-slate-800/80">{ev.type}</span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm leading-snug">{ev.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{ev.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
