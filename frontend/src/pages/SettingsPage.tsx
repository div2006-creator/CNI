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
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-saffron-600" /> System Settings & Architecture Controls
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Configure graph database endpoints, AI/ML extraction thresholds, and environment parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-saffron-500 text-white text-xs font-mono font-bold rounded-lg hover:bg-saffron-600 transition-colors shadow-sm"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-white" /> Settings Saved
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
        <Card title="Graph Storage Architecture (Neo4j)" className="bg-[#fcfcf9] border-[#e5dfd3]">
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">Use Mock Graph Engine</span>
                <span className="text-[11px] text-stone-600 font-sans">Run in-memory synthetic driver without external DB dependency.</span>
              </div>
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMock(e.target.checked)}
                className="w-4 h-4 accent-saffron-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-stone-600 block mb-1">Neo4j Bolt URI</label>
              <input
                type="text"
                value={neo4jUri}
                onChange={(e) => setNeo4jUri(e.target.value)}
                disabled={useMock}
                className="w-full bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg p-2 text-stone-900 focus:border-saffron-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-stone-600 block mb-1">Neo4j Username</label>
              <input
                type="text"
                value="neo4j"
                disabled={useMock}
                className="w-full bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg p-2 text-stone-900 disabled:opacity-50"
              />
            </div>
          </div>
        </Card>

        {/* AI / NLP Extraction Thresholds */}
        <Card title="AI / ML Extraction Parameters" className="bg-[#fcfcf9] border-[#e5dfd3]">
          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-900 font-semibold">NLP Entity Confidence Cutoff</span>
                <span className="text-saffron-700 font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-saffron-600 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 font-sans">Minimum score required for spaCy/Transformer candidate extraction.</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-900 font-semibold">Pattern Alert Risk Threshold</span>
                <span className="text-rose-600 font-bold">{(riskThreshold * 100).toFixed(0)}%</span>
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
              <span className="text-[10px] text-stone-500 font-sans">Minimum risk level to generate automated investigator notifications.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
