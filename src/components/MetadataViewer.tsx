import React, { useState } from 'react';
import { FileCode, Check, Copy, Shield, Camera, Clock, Key } from 'lucide-react';

interface MetadataViewerProps {
  metadata: Record<string, string | number | boolean>;
  sha256Hash: string;
}

export const MetadataViewer: React.FC<MetadataViewerProps> = ({ metadata, sha256Hash }) => {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-sans">
            Container Metadata & Provenance Tags
          </h3>
        </div>

        {/* SHA-256 Copy badge */}
        <div className="flex items-center space-x-2">
          <span className="text-2xs font-mono text-slate-400 hidden sm:inline">SHA-256:</span>
          <button
            onClick={copyHash}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-2xs font-mono rounded-lg bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-300 transition-colors"
            title="Copy cryptographic SHA-256 hash"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span>{sha256Hash ? `${sha256Hash.slice(0, 10)}...${sha256Hash.slice(-8)}` : 'Generating...'}</span>
          </button>
        </div>
      </div>

      {/* Metadata Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(metadata).map(([key, value]) => {
          const isWarning =
            String(value).toLowerCase().includes('stripped') ||
            String(value).toLowerCase().includes('none') ||
            String(value).toLowerCase().includes('unsigned') ||
            String(value).toLowerCase().includes('midjourney') ||
            String(value).toLowerCase().includes('stable diffusion');

          return (
            <div
              key={key}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-1 hover:border-slate-700 transition-colors"
            >
              <span className="text-2xs font-mono text-slate-500 uppercase tracking-wider">
                {key.replace(/_/g, ' ')}
              </span>
              <span
                className={`text-xs font-mono font-medium truncate ${
                  isWarning ? 'text-amber-300' : 'text-slate-200'
                }`}
                title={String(value)}
              >
                {String(value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* C2PA Provenance Note */}
      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 flex items-start space-x-2.5">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-cyan-300">Coalition for Content Provenance and Authenticity (C2PA):</span>
          <p className="text-2xs text-slate-400 leading-relaxed">
            Authentic news agencies and high-end cameras (Leica M11-P, Sony Alpha, Nikon Z6 III) attach cryptographically signed Content Credentials manifests. Most AI generators currently lack genuine cryptographic root-signed manifests or output stripped EXIF structures.
          </p>
        </div>
      </div>
    </div>
  );
};
