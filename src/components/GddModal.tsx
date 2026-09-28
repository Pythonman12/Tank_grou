import React, { useState } from 'react';
import { GDD_DATA } from '../data/gddContent';
import { downloadHwpDocument, downloadPdfDocument, downloadTextDocument } from '../utils/exporter';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  SlidersHorizontal,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface GddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GddModal: React.FC<GddModalProps> = ({ isOpen, onClose }) => {
  const [activeTabId, setActiveTabId] = useState<string>('sec-1');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadHwp = () => {
    downloadHwpDocument();
    showToast('한글 문서(.hwp)가 다운로드되었습니다!');
  };

  const handleDownloadTxt = () => {
    downloadTextDocument();
    showToast('텍스트 문서(.txt)가 다운로드되었습니다!');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await downloadPdfDocument();
      showToast('PDF 문서(.pdf)가 다운로드되었습니다!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const showToast = (msg: string) => {
    setDownloadSuccessMsg(msg);
    setTimeout(() => {
      setDownloadSuccessMsg(null);
    }, 3500);
  };

  const currentSection = GDD_DATA.sections.find((s) => s.id === activeTabId) || GDD_DATA.sections[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  {GDD_DATA.title}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                    {GDD_DATA.version}
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{GDD_DATA.subTitle}</p>
            </div>
          </div>

          {/* Action Buttons: HWP, PDF, TXT, Close */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleDownloadHwp}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/30 active:scale-95 cursor-pointer"
              title="한글과컴퓨터 한글 뷰어/편집기 호환 HWP 서식 파일 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span>한글(.hwp) 다운로드</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-all shadow-md shadow-blue-900/30 active:scale-95 cursor-pointer"
              title="A4 다중 페이지 PDF 포맷 문서 다운로드"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'PDF 생성 중...' : 'PDF 다운로드'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              title="텍스트 파일 다운로드"
            >
              <span>TXT</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="인쇄"
            >
              <Printer className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1" />

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {downloadSuccessMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-72 bg-slate-950/60 border-r border-slate-800 flex flex-col p-4 overflow-y-auto space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              문서 목차 (Index)
            </div>

            {GDD_DATA.sections.map((sec, idx) => {
              const isActive = sec.id === activeTabId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTabId(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{sec.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90 text-blue-400' : 'text-slate-600'}`} />
                </button>
              );
            })}

            {/* Document metadata info box */}
            <div className="mt-auto pt-6 px-3">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
                <div><span className="text-slate-300 font-semibold">작성일:</span> {GDD_DATA.date}</div>
                <div><span className="text-slate-300 font-semibold">기획 팀:</span> {GDD_DATA.author}</div>
                <div><span className="text-slate-300 font-semibold">표준 규격:</span> IEEE 830 / ISO GDD</div>
              </div>
            </div>
          </div>

          {/* Main Document Reading Area */}
          <div className="flex-1 bg-slate-900 overflow-y-auto p-8 font-sans leading-relaxed selection:bg-blue-600 selection:text-white">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Abstract Banner (Always visible on first tab or header) */}
              {activeTabId === 'sec-1' && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-800/50 to-slate-900 border border-blue-500/30 text-slate-300 shadow-inner">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>핵심 기획 의도 및 요약 (Executive Summary)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {GDD_DATA.abstract}
                  </p>
                </div>
              )}

              {/* Active Section Content */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight border-b border-slate-700 pb-3 flex items-center gap-2">
                    {currentSection.title}
                  </h2>
                  <p className="text-sm font-semibold text-blue-400 mt-2">
                    {currentSection.subtitle}
                  </p>
                </div>

                <div className="space-y-3">
                  {currentSection.content.map((p, idx) => (
                    <p key={idx} className="text-sm text-slate-300 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Subsections */}
                {currentSection.subsections && currentSection.subsections.map((sub, sIdx) => (
                  <div key={sIdx} className="mt-8 pt-4 border-t border-slate-800/80 space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {sub.title}
                    </h3>

                    {sub.paragraphs && sub.paragraphs.map((sp, pIdx) => (
                      <p key={pIdx} className="text-sm text-slate-300 leading-relaxed">
                        {sp}
                      </p>
                    ))}

                    {sub.items && (
                      <ul className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                        {sub.items.map((item, iIdx) => (
                          <li key={iIdx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                            <span className="text-blue-400 font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {sub.table && (
                      <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/50 my-4 shadow-md">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700">
                              {sub.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-3 font-semibold text-slate-300">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-sans">
                            {sub.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-3 text-slate-300 ${
                                      cIdx === 0 ? 'font-medium text-blue-300' : ''
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Navigation Footer */}
              <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">프로젝트 대포키우기 GDD</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadHwp}
                    className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>한글 문서 다운로드 (.hwp)</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={handleDownloadPdf}
                    className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF 다운로드 (.pdf)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
