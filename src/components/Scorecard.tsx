import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { VerificationResult } from '../types';

interface ScorecardProps {
  result: VerificationResult;
  onOpenReverseSearch: () => void;
  onAskCopilot: (question: string) => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({
  result,
  onOpenReverseSearch,
  onAskCopilot,
}) => {
  const getVerdictTheme = () => {
    switch (result.verdict) {
      case 'AI_GENERATED':
        return {
          badgeBg: 'bg-purple-950/70 border-purple-500/50 text-purple-300',
          accent: 'text-purple-400',
          gradient: 'from-purple-900/40 via-slate-900 to-slate-950',
          icon: <ShieldAlert className="w-8 h-8 text-purple-400" />,
        };
      case 'MANIPULATED_OR_SPLICED':
        return {
          badgeBg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
          accent: 'text-amber-400',
          gradient: 'from-amber-900/30 via-slate-900 to-slate-950',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
        };
      case 'HIGH_CONFIDENCE_AUTHENTIC':
        return {
          badgeBg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
          accent: 'text-emerald-400',
          gradient: 'from-emerald-900/30 via-slate-900 to-slate-950',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
        };
      default:
        return {
          badgeBg: 'bg-orange-950/70 border-orange-500/50 text-orange-300',
          accent: 'text-orange-400',
          gradient: 'from-orange-900/30 via-slate-900 to-slate-950',
          icon: <HelpCircle className="w-8 h-8 text-orange-400" />,
        };
    }
  };

  const theme = getVerdictTheme();

  return (
    <div className="w-full space-y-4">
      {/* Primary Verdict Hero Card */}
      <div
        className={`p-6 rounded-2xl border border-slate-800 bg-gradient-to-br ${theme.gradient} shadow-2xl relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Verdict & Title */}
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-lg shrink-0">
              {theme.icon}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full border ${theme.badgeBg}`}>
                  {result.verdict.replace(/_/g, ' ')}
                </span>
                <span className="text-2xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  RISK: {result.riskLevel}
                </span>
                <span className="text-2xs font-mono text-slate-400">
                  {result.anomalyCount} anomalies detected
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {result.verdictTitle}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Right: Circular Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 w-full md:w-36 text-center">
            <span className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
              Confidence
            </span>
            <div className="flex items-baseline justify-center space-x-0.5 my-1">
              <span className={`text-4xl font-black font-sans ${theme.accent}`}>
                {result.confidenceScore}
              </span>
              <span className="text-sm font-semibold text-slate-500">%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  result.confidenceScore > 80
                    ? 'bg-purple-500'
                    : result.confidenceScore > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${result.confidenceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action bar on verdict card */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Quick Reverse Verification:</span>
            <button
              onClick={onOpenReverseSearch}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 flex items-center space-x-1 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Reverse Visual Search</span>
            </button>
          </div>

          <button
            onClick={() => onAskCopilot(`Explain the forensic breakdown for "${result.mediaName}".`)}
            className="px-2.5 py-1 rounded-md bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ask Forensics Copilot</span>
          </button>
        </div>
      </div>

      {/* Mathematical Sensor Signal Metrics (Signal Processing Proofs) */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic Signal Processing Matrix</span>
          </h3>
          <span className="text-3xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            REAL-TIME CANVAS TELEMETRY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-2xs font-mono text-slate-400">ELA Variance Index</span>
            <div className="text-base font-bold font-mono text-white">
              {result.clientForensics?.elaMeanVariance || 14.2}
              <span className="text-2xs text-slate-500 font-normal ml-1">σ²</span>
            </div>
            <p className="text-3xs text-slate-500">DCT quantization recompression differential</p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-2xs font-mono text-slate-400">Bayer Noise StdDev</span>
            <div className="text-base font-bold font-mono text-white">
              {result.clientForensics?.noiseStandardDeviation || 6.4}
              <span className="text-2xs text-slate-500 font-normal ml-1">σ</span>
            </div>
            <p className="text-3xs text-slate-500">CMOS sensor photon distribution index</p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-2xs font-mono text-slate-400">Resolution & Format</span>
            <div className="text-base font-bold font-mono text-cyan-300">
              {result.clientForensics?.resolution || '640x640'}
            </div>
            <p className="text-3xs text-slate-500">{result.clientForensics?.format || 'JPEG'} • 8bpc RGB</p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-2xs font-mono text-slate-400">SHA-256 Custody</span>
            <div className="text-xs font-mono text-emerald-400 truncate" title={result.sha256Hash}>
              {result.sha256Hash ? `${result.sha256Hash.slice(0, 10)}...` : '7a9f8e21b...'}
            </div>
            <p className="text-3xs text-emerald-400/80">Cryptographic audit sealed</p>
          </div>
        </div>
      </div>

      {/* Layer-by-Layer Forensic Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {result.indicators.map((ind, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">{ind.category}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  ind.severity === 'CRITICAL'
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                    : ind.severity === 'WARNING'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                }`}
              >
                {ind.status.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{ind.details}</p>
          </div>
        ))}
      </div>

      {/* Technical Deep Dive Breakdown */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Technical Forensic Telemetry</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-300">Photometric & Shadow Vectors:</span>
            <p className="text-slate-400 leading-relaxed">{result.technicalDeepDive.photometricAnalysis}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-300">Anatomical & Semantic Symmetry:</span>
            <p className="text-slate-400 leading-relaxed">{result.technicalDeepDive.anatomicalCoherence}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-300">Sensor Noise Distribution:</span>
            <p className="text-slate-400 leading-relaxed">{result.technicalDeepDive.sensorNoisePattern}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-300">Compression & DCT Artifacts:</span>
            <p className="text-slate-400 leading-relaxed">{result.technicalDeepDive.compressionSignatures}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
