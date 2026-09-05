import React, { useState } from 'react';
import { History, Search, Trash2, ArrowRight, ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';
import { VerificationResult } from '../types';

interface HistoryWorkspaceProps {
  history: VerificationResult[];
  onSelectResult: (result: VerificationResult) => void;
  onClearHistory: () => void;
  onDeleteResult: (id: string) => void;
}

export const HistoryWorkspace: React.FC<HistoryWorkspaceProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  onDeleteResult,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');

  const filtered = history.filter((item) => {
    const matchesSearch = item.mediaName.toLowerCase().includes(searchQuery.toLowerCase()) || item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerdict = filterVerdict === 'ALL' || item.verdict === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'AI_GENERATED':
        return <ShieldAlert className="w-4 h-4 text-purple-400" />;
      case 'MANIPULATED_OR_SPLICED':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'HIGH_CONFIDENCE_AUTHENTIC':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">
            Forensics Verification History ({history.length})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search past scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-200"
            />
          </div>

          {/* Verdict Filter */}
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="AI_GENERATED">AI Generated</option>
            <option value="MANIPULATED_OR_SPLICED">Manipulated</option>
            <option value="HIGH_CONFIDENCE_AUTHENTIC">Authentic</option>
            <option value="SUSPICIOUS_ANOMALIES">Suspicious</option>
          </select>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:text-rose-400 text-slate-400 transition-colors"
              title="Clear all saved history"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 space-y-2">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-300">No verification scans found</p>
          <p className="text-xs text-slate-500">
            Uploaded or preset media verifications will be permanently stored here in your local audit ledger.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all group"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  {getVerdictIcon(item.verdict)}
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {item.mediaName}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {item.mediaType.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{item.summary}</p>
                <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 pt-0.5">
                  <span>CONFIDENCE: {item.confidenceScore}%</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className="truncate max-w-[140px]">{item.sha256Hash}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onSelectResult(item)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-slate-950 flex items-center space-x-1 transition-all"
                >
                  <span>Re-examine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteResult(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete scan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
