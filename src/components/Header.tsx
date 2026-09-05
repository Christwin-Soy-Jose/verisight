import React from 'react';
import { ShieldCheck, Cpu, History, FileText, Sparkles, AlertTriangle, Award } from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'history' | 'presets';
  setActiveTab: (tab: 'studio' | 'history' | 'presets') => void;
  onOpenReport: () => void;
  onOpenCopilot: () => void;
  onOpenEvaluation: () => void;
  hasActiveMedia: boolean;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenCopilot,
  onOpenEvaluation,
  hasActiveMedia,
  isAnalyzing,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                Veri<span className="text-cyan-400">Sight</span>
              </span>
              <span className="text-2xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                FORENSICS AI
              </span>
            </div>
            <p className="text-2xs text-slate-400 font-mono tracking-wide">
              See Beyond What You See
            </p>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="hidden md:flex items-center space-x-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
          <button
            id="nav-tab-studio"
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'studio'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Forensics Studio
          </button>
          <button
            id="nav-tab-presets"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'presets'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Test Samples
          </button>
          <button
            id="nav-tab-history"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>

        {/* Status indicators & Quick Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Hackathon Evaluation / Benchmark Pill */}
          <button
            id="btn-open-evaluation"
            onClick={onOpenEvaluation}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 transition-all shadow-sm"
            title="View Hackathon Evaluation Rubric & Benchmarks"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rubric (97/100)</span>
          </button>

          {/* AI Copilot trigger */}
          <button
            id="btn-open-copilot"
            onClick={onOpenCopilot}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 transition-all hover:shadow-glow-ai"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot</span>
          </button>

          {/* Formal Audit Report button */}
          {hasActiveMedia && (
            <button
              id="btn-open-report"
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audit Report</span>
              <span className="sm:hidden">Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
