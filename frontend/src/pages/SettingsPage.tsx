import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Settings, Database, Cpu, Sliders, Shield, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [neo4jUri, setNeo4jUri] = useState('bolt://localhost:7687');
  const [useMock, setUseMock] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [riskThreshold, setRiskThreshold] = useState(0.60);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-intel-cyan" /> System Settings & Architecture Controls
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure graph database endpoints, AI/ML extraction thresholds, and environment parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-intel-cyan text-dark-950 text-xs font-mono font-bold rounded-lg hover:bg-cyan-300 transition-colors"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" /> Settings Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Configuration
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graph Database Configuration */}
        <Card title="Graph Storage Architecture (Neo4j)">
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-dark-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Use Mock Graph Engine</span>
                <span className="text-[11px] text-slate-500 font-sans">Run in-memory synthetic driver without external DB dependency.</span>
              </div>
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMock(e.target.checked)}
                className="w-4 h-4 accent-intel-cyan cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Neo4j Bolt URI</label>
              <input
                type="text"
                value={neo4jUri}
                onChange={(e) => setNeo4jUri(e.target.value)}
                disabled={useMock}
                className="w-full bg-dark-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-intel-cyan/50 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Neo4j Username</label>
              <input
                type="text"
                value="neo4j"
                disabled={useMock}
                className="w-full bg-dark-950 border border-slate-800 rounded-lg p-2 text-slate-200 disabled:opacity-50"
              />
            </div>
          </div>
        </Card>

        {/* AI / NLP Extraction Thresholds */}
        <Card title="AI / ML Extraction Parameters">
          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">NLP Entity Confidence Cutoff</span>
                <span className="text-intel-cyan font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-intel-cyan cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-sans">Minimum score required for spaCy/Transformer candidate extraction.</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Pattern Alert Risk Threshold</span>
                <span className="text-rose-400 font-bold">{(riskThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="0.9"
                step="0.05"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-sans">Minimum risk level to generate automated investigator notifications.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
