import React from 'react';
import { X, Printer, Download, ShieldCheck, ShieldAlert, CheckCircle, FileSpreadsheet, FileCode } from 'lucide-react';
import { VerificationResult, MediaItem } from '../types';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult | null;
  media: MediaItem | null;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  result,
  media,
}) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `VeriSight_Audit_${result.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Audit ID', result.id],
      ['Media File', result.mediaName],
      ['Media Type', result.mediaType],
      ['Verification Timestamp', result.timestamp],
      ['Verdict', result.verdict],
      ['Verdict Title', result.verdictTitle],
      ['Confidence Score', `${result.confidenceScore}%`],
      ['Risk Level', result.riskLevel],
      ['SHA-256 Hash', result.sha256Hash],
      ['Summary', `"${result.summary.replace(/"/g, '""')}"`],
      ['Anomalies Count', result.anomalyCount],
      ['ELA Mean Variance', result.clientForensics.elaMeanVariance],
      ['Sensor Noise StdDev', result.clientForensics.noiseStandardDeviation],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `VeriSight_Audit_${result.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Toolbar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Formal Authenticity Audit Report</h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition-colors"
              title="Export CSV audit spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition-colors"
              title="Export complete JSON telemetry"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible print:text-black">
          {/* Document Header Letterhead */}
          <div className="border-b border-slate-800 print:border-gray-300 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white print:text-black font-sans">
                  VeriSight AI
                </span>
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 print:border-gray-400 print:text-gray-800">
                  DIGITAL FORENSICS LAB
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600 font-mono mt-1">
                Authenticity & Provenance Audit Certificate • ISO/IEC 27037 Compatible
              </p>
            </div>

            <div className="text-right font-mono text-2xs text-slate-400 print:text-gray-600 space-y-0.5">
              <div>REPORT ID: {result.id}</div>
              <div>DATE: {new Date(result.timestamp).toUTCString()}</div>
              <div>ENGINE: VeriSight v2.4 (Gemini 3.8 Flash)</div>
            </div>
          </div>

          {/* Certificate Verdict Banner */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 print:border-gray-300 print:bg-gray-50 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-2xs font-mono text-slate-400 print:text-gray-600 uppercase">
                  FORENSIC DETERMINATION
                </span>
                <h2 className="text-lg font-bold text-white print:text-black">
                  {result.verdictTitle}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-2xs font-mono text-slate-400 print:text-gray-600">CONFIDENCE</span>
                <p className="text-3xl font-black text-cyan-400 print:text-blue-700">
                  {result.confidenceScore}%
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Evidence Item Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200">
              <span className="text-slate-500 text-2xs block">TARGET FILE</span>
              <span className="font-semibold text-slate-200 print:text-black truncate block">
                {result.mediaName}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200">
              <span className="text-slate-500 text-2xs block">MEDIA FORMAT</span>
              <span className="font-semibold text-slate-200 print:text-black uppercase">
                {result.mediaType} ({result.clientForensics.format || 'Standard'})
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200">
              <span className="text-slate-500 text-2xs block">RISK TIER</span>
              <span className="font-semibold text-slate-200 print:text-black">
                {result.riskLevel}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200">
              <span className="text-slate-500 text-2xs block">ANOMALY COUNT</span>
              <span className="font-semibold text-slate-200 print:text-black">
                {result.anomalyCount} Flagged
              </span>
            </div>
          </div>

          {/* Cryptographic Proof Fingerprint */}
          <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200 font-mono text-xs">
            <span className="text-slate-500 text-2xs block">CRYPTOGRAPHIC SHA-256 HASH</span>
            <span className="text-cyan-300 print:text-blue-800 select-all break-all">
              {result.sha256Hash}
            </span>
          </div>

          {/* Forensic Indicators Audit Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 print:text-gray-700 uppercase">
              Multi-Layer Signal Matrix:
            </h3>
            <div className="border border-slate-800 print:border-gray-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-gray-700 border-b border-slate-800 print:border-gray-300">
                  <tr>
                    <th className="p-3 font-medium">Domain</th>
                    <th className="p-3 font-medium">Determination</th>
                    <th className="p-3 font-medium">Technical Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                  {result.indicators.map((ind, i) => (
                    <tr key={i} className="hover:bg-slate-950/40">
                      <td className="p-3 font-semibold text-slate-200 print:text-black">{ind.category}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700 print:border-gray-300">
                          {ind.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 print:text-gray-700">{ind.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Citations Attached */}
          {result.citations && result.citations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-slate-400 print:text-gray-700 uppercase">
                Attached Fact-Check Citations ({result.citations.length}):
              </h3>
              <div className="space-y-2">
                {result.citations.map((cite) => (
                  <div
                    key={cite.id}
                    className="p-3 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200 text-xs font-mono space-y-1"
                  >
                    <div className="font-semibold text-slate-200 print:text-black">
                      {cite.title} — <span className="text-slate-500">[{cite.sourceName}]</span>
                    </div>
                    <div className="text-slate-400 print:text-gray-600 text-2xs truncate">{cite.url}</div>
                    <div className="text-slate-300 print:text-gray-800 italic">"{cite.notes}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature & Seal Block */}
          <div className="pt-6 border-t border-slate-800 print:border-gray-300 grid grid-cols-2 gap-8 text-xs font-mono">
            <div className="space-y-3">
              <span className="text-slate-500 block text-2xs">AUTOMATED AI SIGNATURE</span>
              <div className="h-10 border-b border-dashed border-slate-700 flex items-center text-cyan-400 print:text-blue-700 text-sm italic font-serif">
                VeriSight Core Security Engine
              </div>
              <p className="text-2xs text-slate-500">
                Processed via Gemini 3.8 Flash Model Runtime
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-slate-500 block text-2xs">INVESTIGATOR / FACT-CHECKER ENDORSEMENT</span>
              <div className="h-10 border-b border-dashed border-slate-700 flex items-center text-slate-400 text-xs italic">
                Verified Cryptographic Authenticity Audit Trail
              </div>
              <p className="text-2xs text-slate-500">Authorized Investigator Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
