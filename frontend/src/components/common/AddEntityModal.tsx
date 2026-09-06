import React, { useState } from 'react';
import { X, Plus, ShieldCheck } from 'lucide-react';
import { Entity, EntityType, RiskLevel } from '../../types';
import { apiService } from '../../services/api';

interface AddEntityModalProps {
  onClose: () => void;
  onCreated: (entity: Entity) => void;
}

const entityTypes: EntityType[] = ['PERSON', 'ORGANIZATION', 'ACCOUNT', 'PHONE', 'LOCATION', 'VEHICLE', 'DOCUMENT'];
const riskLevels: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

export const AddEntityModal: React.FC<AddEntityModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('PERSON');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('MEDIUM');
  const [riskScore, setRiskScore] = useState('0.5');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Enter a name or identifier for this record.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const entity = await apiService.createEntity({
        name: name.trim(),
        type,
        risk_level: riskLevel,
        risk_score: Math.min(1, Math.max(0, Number(riskScore) || 0)),
        attributes: notes.trim() ? { notes: notes.trim() } : {},
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      onCreated(entity);
      onClose();
    } catch {
      setError('The record could not be saved. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4" role="dialog" aria-modal="true" aria-labelledby="add-record-title">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-dark-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 id="add-record-title" className="flex items-center gap-2 text-lg font-bold text-slate-100">
              <Plus className="h-5 w-5 text-intel-blue" /> Add intelligence record
            </h2>
            <p className="mt-1 text-xs text-slate-400">Create a subject, organization, account, device, or source record for investigator review.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close add record dialog" className="rounded-lg p-2 text-slate-400 hover:bg-dark-850 hover:text-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-semibold text-slate-300 sm:col-span-2">
              Name or identifier
              <input value={name} onChange={event => setName(event.target.value)} autoFocus placeholder="e.g. Subject Echo or account number" className="intel-glass-input w-full" />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-300">
              Record type
              <select value={type} onChange={event => setType(event.target.value as EntityType)} className="intel-glass-input w-full">
                {entityTypes.map(option => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-300">
              Risk level
              <select value={riskLevel} onChange={event => setRiskLevel(event.target.value as RiskLevel)} className="intel-glass-input w-full">
                {riskLevels.map(option => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-300">
              Risk score (0 to 1)
              <input type="number" min="0" max="1" step="0.1" value={riskScore} onChange={event => setRiskScore(event.target.value)} className="intel-glass-input w-full" />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-300">
              Tags
              <input value={tags} onChange={event => setTags(event.target.value)} placeholder="alias, financial, priority" className="intel-glass-input w-full" />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-300 sm:col-span-2">
              Investigator notes
              <textarea value={notes} onChange={event => setNotes(event.target.value)} rows={3} placeholder="Record the known context or source note" className="intel-glass-input w-full resize-none" />
            </label>
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Human review required</span>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-dark-850">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-intel-cyan px-4 py-2 text-xs font-bold text-white hover:bg-intel-blue disabled:opacity-50"><Plus className="h-4 w-4" /> {saving ? 'Saving...' : 'Add record'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
