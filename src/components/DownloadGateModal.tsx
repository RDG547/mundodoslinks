'use client';

import { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, ExternalLink, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DownloadGateModalProps {
  postId: string;
  postTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadGateModal({
  postId,
  postTitle,
  isOpen,
  onClose,
}: DownloadGateModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setUnlockedUrl(null);
      setErrorMsg(null);
      setLoading(false);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleUnlockAndVerify = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Step 1: Solicitar ao backend serverless o token HMAC assinado
      const genRes = await fetch('/api/gerar-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.success) {
        throw new Error(genData.erro || 'Falha ao gerar permissão de download.');
      }

      // Step 2: Validar o token assinado via /api/validar
      const valRes = await fetch(genData.validateUrl);
      const valData = await valRes.json();

      if (!valRes.ok || !valData.liberado) {
        throw new Error(valData.erro || 'Falha na verificação de segurança do link.');
      }

      setUnlockedUrl(valData.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao desbloquear link.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center glow-emerald">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verificação de Segurança</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{postTitle}</p>
        </div>

        {/* Lock / Verification Process */}
        <div className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span>Protocolo HMAC SHA256</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Antivírus & Safe
            </span>
          </div>

          {unlockedUrl ? (
            <div className="space-y-4 text-center">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Link Verificado & Liberado com Sucesso!
              </div>

              <a
                href={unlockedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition"
              >
                <Download className="w-5 h-5" />
                <span>Baixar Agora (Link Direto)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {countdown > 0 ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <span className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400 animate-pulse">
                    {countdown}s
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gerando chave temporária com criptografia HMAC...</p>
                </div>
              ) : (
                <button
                  onClick={handleUnlockAndVerify}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Validando Assinatura Temporal...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Obter Link Encurtado Protegido</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <p>O link gerado é único e possui validade estrita de 15 minutos.</p>
          <p>Seus downloads ajudam a manter a infraestrutura open source ativa.</p>
        </div>
      </div>
    </div>
  );
}
