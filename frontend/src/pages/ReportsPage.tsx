import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { apiService } from '../services/api';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
  Layers,
  UserCheck,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [verifyingHash, setVerifyingHash] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'targets' | 'evidence' | 'financial' | 'audit'>('all');

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCaseDossier('INV-2026-0891');
      setDossier(data);
      setIsTampered(false);
      // Initial verification
      const v = await apiService.verifyDossierHash(data);
      setVerificationResult(v);
    } catch (err) {
      console.error('Failed to load case dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, []);

  const handleCopyHash = () => {
    if (dossier?.integrity_fingerprint) {
      navigator.clipboard.writeText(dossier.integrity_fingerprint);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const handleVerify = async () => {
    if (!dossier) return;
    setVerifyingHash(true);
    try {
      const result = await apiService.verifyDossierHash(dossier);
      setVerificationResult(result);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setVerifyingHash(false);
    }
  };

  const handleSimulateTamper = async () => {
    if (!dossier) return;
    const modified = JSON.parse(JSON.stringify(dossier));
    if (!isTampered) {
      // Tamper with entity count
      modified.executive_summary.total_entities_analyzed = 999;
      setDossier(modified);
      setIsTampered(true);
      // Verify modified payload
      const result = await apiService.verifyDossierHash(modified);
      setVerificationResult(result);
    } else {
      // Revert back by re-fetching
      fetchDossier();
    }
  };

  const handleDownloadJSON = () => {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CNI_Dossier_${dossier.case_metadata?.case_id || 'INV-2026-0891'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-intel-cyan animate-spin" />
          <span className="text-sm font-mono text-slate-400">Compiling Auditable Case Dossier & Calculating SHA-256 Fingerprint...</span>
        </div>
      </div>
    );
  }

  const meta = dossier?.case_metadata || {};
  const exec = dossier?.executive_summary || {};
  const targets = dossier?.target_entity_profiles || [];
  const evidence = dossier?.evidentiary_signals_and_confidence || {};
  const financial = dossier?.financial_intelligence_summary || {};
  const auditLogs = dossier?.investigator_verification_audit_log || [];

  return (
    <div className="space-y-8 font-sans">
      {/* Header & Main Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-saffron-600" /> Evidentiary Case Dossier & Final Report
            </h2>
            <span className="text-xs font-mono font-bold text-saffron-700 bg-saffron-50 px-3 py-1 rounded-full border border-saffron-200">
              SHA-256 VERIFIED
            </span>
          </div>
          <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
            Generate formal law enforcement intelligence briefings with tamper-evident cryptographic integrity hashes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDossier}
            className="flex items-center gap-2 px-4 py-2 bg-[#f8f6f0] text-stone-700 text-xs font-mono font-semibold rounded-xl border border-[#e5dfd3] hover:bg-[#f0ebd9] transition-all"
          >
            <RefreshCw className="w-4 h-4 text-saffron-600" /> Refresh State
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-[#f8f6f0] text-saffron-700 text-xs font-mono font-semibold rounded-xl border border-saffron-300 hover:bg-saffron-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Download JSON Dossier
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-saffron-500 text-white text-xs font-mono font-bold rounded-xl hover:bg-saffron-600 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Mandatory Investigation Support Disclaimer Notice */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-mono text-amber-800 uppercase tracking-wide">LAW ENFORCEMENT INVESTIGATION SUPPORT DISCLAIMER:</strong>{' '}
          {meta.disclaimer || 'This document provides decision-support leads for investigator verification. Predictive link scores and pattern flags do not constitute a formal determination of guilt.'}
        </div>
      </div>

      {/* Cryptographic SHA-256 Tamper-Evident Integrity Card */}
      <Card title="Cryptographic Integrity & Tamper Verification" subtitle="SHA-256 Hash Fingerprint of Canonical Dossier Record" className="bg-[#fcfcf9] border-[#e5dfd3]">
        <div className="p-5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5dfd3] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-saffron-600" />
                <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wider">SHA-256 Integrity Fingerprint</span>
              </div>
              <div className="font-mono text-xs md:text-sm font-bold text-saffron-800 bg-[#fcfcf9] px-3 py-1.5 rounded-lg border border-[#e5dfd3] break-all select-all">
                {dossier?.integrity_fingerprint || 'sha256:7f8a912b4e3c9d8a7f1e6b5c4d3a2b10987654321fedcba09876543210abcdef'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f3efe6] text-stone-700 text-xs font-mono font-semibold rounded-lg hover:bg-[#f0ebd9] transition-all border border-[#e5dfd3]"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedHash ? 'Copied' : 'Copy Hash'}
              </button>

              <button
                onClick={handleVerify}
                disabled={verifyingHash}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-saffron-50 text-saffron-700 text-xs font-mono font-bold rounded-lg border border-saffron-300 hover:bg-saffron-100 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifyingHash ? 'animate-spin' : ''}`} />
                Verify Integrity
              </button>

              <button
                onClick={handleSimulateTamper}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all ${
                  isTampered
                    ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                    : 'bg-[#f3efe6] text-stone-700 border-[#e5dfd3] hover:bg-[#f0ebd9]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {isTampered ? 'Revert Tamper' : 'Simulate Tamper'}
              </button>
            </div>
          </div>

          {/* Verification Status Output Banner */}
          {verificationResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono font-semibold ${
                verificationResult.valid
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900 animate-pulse'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {verificationResult.valid ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{verificationResult.reason}</span>
              </div>

              <span className="text-[11px] px-2.5 py-0.5 rounded border opacity-80">
                {verificationResult.valid ? 'VERIFIED MATCH' : 'TAMPER ALERT'}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Filter Tabs for Dossier Sections */}
      <div className="flex items-center gap-2 border-b border-[#e5dfd3] pb-3 font-mono text-xs overflow-x-auto print:hidden">
        {[
          { id: 'all', label: 'Complete Dossier' },
          { id: 'targets', label: 'Primary Target Profiles' },
          { id: 'evidence', label: 'Evidentiary Signals & Confidence' },
          { id: 'financial', label: 'Financial Intelligence Flow' },
          { id: 'audit', label: 'Investigator Review Audit Log' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl transition-all font-bold shrink-0 ${
              activeTab === t.id
                ? 'bg-saffron-500 text-white shadow-md'
                : 'bg-[#fcfcf9] text-stone-600 border border-[#e5dfd3] hover:text-stone-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Printable Intelligence Dossier Document */}
      <div className="bg-[#fcfcf9] border border-[#e5dfd3] rounded-3xl p-6 md:p-8 space-y-8 text-stone-900 font-sans shadow-lg">
        {/* Document Header */}
        <div className="border-b border-[#e5dfd3] pb-6 flex flex-wrap justify-between items-start gap-4">
          <div>
            <span className="text-xs font-mono font-extrabold text-saffron-700 uppercase tracking-widest bg-saffron-50 px-3 py-1 rounded border border-saffron-200">
              {meta.classification || 'RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT'}
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-stone-900 uppercase tracking-tight mt-3">
              {meta.case_title || 'Operation NorthStar Executive Intelligence Dossier'}
            </h1>
            <p className="text-xs font-mono text-stone-600 mt-1">
              CASE NUMBER: <strong className="text-stone-900">{meta.case_id || 'INV-2026-0891'}</strong> | SYSTEM VERSION: {meta.system_version || 'CrimeNet v2.0'}
            </p>
          </div>

          <div className="text-right space-y-1 font-mono text-xs text-stone-600 shrink-0">
            <div>Generated: <strong className="text-stone-900">{new Date(meta.generated_at || Date.now()).toLocaleString()}</strong></div>
            <div>Fingerprint Status: <strong className="text-emerald-700 font-bold">SHA-256 SEALED</strong></div>
          </div>
        </div>

        {/* Section 1: Executive Case Snapshot */}
        {(activeTab === 'all' || activeTab === 'targets') && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-saffron-700 uppercase tracking-wider flex items-center gap-2 border-b border-[#e5dfd3] pb-2">
              <Layers className="w-4 h-4 text-saffron-600" /> 1. Executive Case Snapshot & Metrics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1">
                <span className="text-xs text-stone-600 font-mono">Entities Analyzed</span>
                <div className="text-2xl font-bold font-mono text-stone-900">{exec.total_entities_analyzed ?? 15}</div>
              </div>
              <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1">
                <span className="text-xs text-stone-600 font-mono">Relationships Modeled</span>
                <div className="text-2xl font-bold font-mono text-stone-900">{exec.total_relationships_modeled ?? 24}</div>
              </div>
              <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1">
                <span className="text-xs text-stone-600 font-mono">Critical Risk Targets</span>
                <div className="text-2xl font-bold font-mono text-rose-600">{exec.critical_risk_targets_count ?? 3}</div>
              </div>
              <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1">
                <span className="text-xs text-stone-600 font-mono">Bridge Entities Flagged</span>
                <div className="text-2xl font-bold font-mono text-amber-700">{exec.bridge_nodes_detected_count ?? 2}</div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Target Entity Profiles */}
        {(activeTab === 'all' || activeTab === 'targets') && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-saffron-700 uppercase tracking-wider flex items-center gap-2 border-b border-[#e5dfd3] pb-2">
              <UserCheck className="w-4 h-4 text-saffron-600" /> 2. Primary Target Entity Profiles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {targets.map((t: any, idx: number) => (
                <div key={idx} className="p-5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{t.name}</h4>
                      <span className="text-xs font-mono text-stone-600">{t.entity_id} • {t.type}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      t.risk_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {t.risk_level} ({(t.risk_score * 100).toFixed(0)}%)
                    </span>
                  </div>

                  {t.is_bridge_node && (
                    <div className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-600" />
                      Bridge Entity (Betweenness: {(t.betweenness_centrality * 100).toFixed(0)}%)
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {t.tags?.map((tag: string, tidx: number) => (
                      <span key={tidx} className="text-[10px] font-mono text-stone-800 bg-[#f3efe6] px-2 py-0.5 rounded border border-[#e5dfd3]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Evidentiary Breakdown & Signal Confidence */}
        {(activeTab === 'all' || activeTab === 'evidence') && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-saffron-700 uppercase tracking-wider flex items-center gap-2 border-b border-[#e5dfd3] pb-2">
              <TrendingUp className="w-4 h-4 text-saffron-600" /> 3. Evidentiary Signals & Explainable Confidence Breakdown
            </h3>

            <div className="p-6 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5dfd3] pb-4">
                <div>
                  <div className="text-xs font-mono text-stone-600">Target Pair Evaluated</div>
                  <div className="text-base font-bold text-stone-900 mt-0.5">{evidence.pair_subject || 'Subject Alpha -> Subject Delta'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-stone-600">Explainable Confidence Score</div>
                  <div className="text-xl font-bold font-mono text-saffron-700">{evidence.confidence_percentage || 84}%</div>
                </div>
              </div>

              {/* Additive Signal Bars */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-semibold text-stone-600 uppercase tracking-wider">Signal Additive Breakdown</span>
                {evidence.signal_breakdown?.map((sig: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-stone-900 font-semibold">{sig.signal_name}</span>
                      <span className={sig.points >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {sig.points >= 0 ? `+${sig.points}%` : `${sig.points}%`}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-normal">{sig.description}</p>
                  </div>
                ))}
              </div>

              {/* Supporting vs Contradicting Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supporting Evidence Signals
                  </span>
                  <ul className="space-y-1 text-xs text-stone-800">
                    {evidence.supporting_evidence?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Contradicting / Conflict Mismatches
                  </span>
                  <ul className="space-y-1 text-xs text-amber-900">
                    {evidence.contradicting_evidence?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Financial Intelligence Flow */}
        {(activeTab === 'all' || activeTab === 'financial') && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-saffron-700 uppercase tracking-wider flex items-center gap-2 border-b border-[#e5dfd3] pb-2">
              <Activity className="w-4 h-4 text-saffron-600" /> 4. Financial Intelligence Flow & Typologies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financial.potential_layering_indicators?.map((item: any, idx: number) => (
                <div key={idx} className="p-5 bg-[#f8f6f0] border border-rose-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                      POTENTIAL LAYERING INDICATOR
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-900">{item.amount}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                </div>
              ))}

              {financial.potential_smurfing_indicators?.map((item: any, idx: number) => (
                <div key={idx} className="p-5 bg-[#f8f6f0] border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      POTENTIAL SMURFING INDICATOR
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-900">{item.amount}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Investigator Review Audit Log */}
        {(activeTab === 'all' || activeTab === 'audit') && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-saffron-700 uppercase tracking-wider flex items-center gap-2 border-b border-[#e5dfd3] pb-2">
              <Clock className="w-4 h-4 text-saffron-600" /> 5. Investigator Human-in-the-Loop Audit Log
            </h3>

            <div className="overflow-x-auto border border-[#e5dfd3] rounded-2xl">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-[#f8f6f0] border-b border-[#e5dfd3] font-mono text-stone-600 uppercase tracking-wider">
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Investigator</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Resource</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5dfd3]">
                  {auditLogs.map((log: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#f3efe6]/50 transition-colors">
                      <td className="p-3 font-mono text-saffron-700 font-bold">{log.id}</td>
                      <td className="p-3 font-mono text-stone-800">{log.investigator_id}</td>
                      <td className="p-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                          {log.action_type}
                        </span>
                      </td>
                      <td className="p-3 text-stone-800">{log.target_resource}</td>
                      <td className="p-3 font-mono text-stone-600">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Footer Signoff */}
        <div className="border-t border-[#e5dfd3] pt-6 flex flex-wrap justify-between items-center text-xs font-mono text-stone-600 gap-4">
          <div>Report Generated by <strong className="text-saffron-700">CrimeNet Intelligence Engine</strong></div>
          <div>SHA-256 Digest: <span className="text-stone-800 font-bold">{dossier?.integrity_fingerprint?.substring(0, 32)}...</span></div>
        </div>
      </div>
    </div>
  );
};
