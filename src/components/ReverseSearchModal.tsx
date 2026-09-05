import React, { useState } from 'react';
import { X, ExternalLink, Globe, Plus, Trash2, ShieldCheck, CheckCircle } from 'lucide-react';
import { Citation } from '../types';

interface ReverseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaName: string;
  keywords: string[];
  citations: Citation[];
  onAddCitation: (citation: Citation) => void;
  onRemoveCitation: (id: string) => void;
}

export const ReverseSearchModal: React.FC<ReverseSearchModalProps> = ({
  isOpen,
  onClose,
  mediaName,
  keywords,
  citations,
  onAddCitation,
  onRemoveCitation,
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const searchQuery = keywords.join(' ') || mediaName;

  const handleCreateCitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) return;

    const citation: Citation = {
      id: `cite-${Date.now()}`,
      url: newUrl.trim(),
      title: newTitle.trim(),
      sourceName: newSourceName.trim() || 'External Fact-Check Authority',
      notes: newNotes.trim() || 'Verified independently against external registry.',
      verifiedDate: new Date().toISOString().split('T')[0],
    };

    onAddCitation(citation);
    setNewUrl('');
    setNewTitle('');
    setNewSourceName('');
    setNewNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">
              Source Verification & Reverse Visual Search
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Launch Reverse Search Engines */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Launch Global Visual Search Engines
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <a
                href={`https://lens.google.com/`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-200 transition-all group"
              >
                <span>Google Lens</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href={`https://tineye.com/`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-200 transition-all group"
              >
                <span>TinEye Forensics</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href={`https://www.bing.com/visualsearch`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-200 transition-all group"
              >
                <span>Bing Visual</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href={`https://yandex.com/images/`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-200 transition-all group"
              >
                <span>Yandex Image Search</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href={`https://www.factcheck.org/?s=${encodeURIComponent(searchQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-200 transition-all group"
              >
                <span>FactCheck.org</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href={`https://www.snopes.com/search/${encodeURIComponent(searchQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-200 transition-all group"
              >
                <span>Snopes Fact Database</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>
            </div>
          </div>

          {/* Fact-Checker Custom Citation Form */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center justify-between">
              <span>Attach Fact-Check Reference Citation</span>
              <span className="text-2xs font-normal text-slate-500">Appends to Audit PDF Report</span>
            </h4>

            <form onSubmit={handleCreateCitation} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Article / Source Title (e.g. Reuters Fact Check)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Authoritative Source (e.g. Associated Press)"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-200"
                />
              </div>

              <input
                type="url"
                placeholder="https://www.example.com/debunk-or-original-story"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-200"
                required
              />

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Analyst Notes (e.g. Original photo verified in AP archive from 2018)"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-200"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center space-x-1 shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach</span>
                </button>
              </div>
            </form>
          </div>

          {/* Attached Citations List */}
          {citations.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-2xs font-mono text-slate-400">
                ATTACHED AUDIT CITATIONS ({citations.length}):
              </span>
              <div className="space-y-2">
                {citations.map((cite) => (
                  <div
                    key={cite.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between space-x-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-cyan-300">{cite.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">[{cite.sourceName}]</span>
                      </div>
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-2xs text-slate-400 hover:text-cyan-400 underline truncate block max-w-md"
                      >
                        {cite.url}
                      </a>
                      <p className="text-2xs text-slate-400 italic">"{cite.notes}"</p>
                    </div>

                    <button
                      onClick={() => onRemoveCitation(cite.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
