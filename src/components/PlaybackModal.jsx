import { useEffect, useMemo, useRef, useState } from "react";

function formatTs(ts) {
  try {
    return new Date(ts).toLocaleString("pt-BR");
  } catch {
    return ts;
  }
}

function PlaybackModal({ open, onClose, events }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900); // ms por evento
  const timerRef = useRef(null);

  // trava scroll do body
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  const list = useMemo(() => (events || []).slice().reverse(), [events]); // do mais antigo -> recente

  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setPlaying(false);
  }, [open]);

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => {
    if (!open) return;
    stopTimer();

    if (playing && list.length > 0) {
      timerRef.current = setInterval(() => {
        setIdx((i) => {
          if (i >= list.length - 1) {
            // terminou
            return i;
          }
          return i + 1;
        });
      }, speed);
    }

    return () => stopTimer();
  }, [open, playing, speed, list.length]);

  useEffect(() => {
    if (!open) return;
    // se chegou no fim, para
    if (playing && idx >= list.length - 1 && list.length > 0) {
      setPlaying(false);
    }
  }, [idx, playing, open, list.length]);

  if (!open) return null;

  const current = list[idx];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div
          className="w-full max-w-5xl rounded-3xl border border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950 shadow-2xl overflow-hidden"
          style={{ maxHeight: "92vh" }}
        >
          {/* header */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  🎬 Playback Mode
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Replay dos eventos da auditoria (ideal pra demo / gravação)
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              >
                Fechar
              </button>
            </div>

            {/* controls */}
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPlaying((p) => !p)}
                  disabled={list.length === 0}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {playing ? "Pausar" : "Play"}
                </button>

                <button
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  disabled={idx <= 0}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >
                  ◀︎ Voltar
                </button>

                <button
                  onClick={() => setIdx((i) => Math.min(list.length - 1, i + 1))}
                  disabled={idx >= list.length - 1}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >
                  Avançar ▶︎
                </button>

                <button
                  onClick={() => {
                    setIdx(0);
                    setPlaying(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                >
                  Reiniciar
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">Velocidade</div>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
                    dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
                >
                  <option value={1500}>Lenta</option>
                  <option value={900}>Normal</option>
                  <option value={450}>Rápida</option>
                </select>

                <div className="text-sm text-gray-600 dark:text-gray-300 ml-3">
                  {list.length ? `${idx + 1}/${list.length}` : "0/0"}
                </div>
              </div>
            </div>
          </div>

          {/* content */}
          <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(92vh - 140px)" }}>
            {list.length === 0 ? (
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                Nenhum evento na auditoria ainda. Faça ações (importar, registrar contato, mudar status) e volte aqui.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* current event */}
                <div className="lg:col-span-1">
                  <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Evento atual</div>

                    <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                      {current?.type || "—"}
                    </div>

                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formatTs(current?.ts)}
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                      {current?.message}
                    </div>

                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Ator: <span className="font-semibold text-gray-900 dark:text-white">{current?.actor || "sistema"}</span>
                    </div>
                  </div>
                </div>

                {/* list */}
                <div className="lg:col-span-2">
                  <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Timeline (auditoria)
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      O item atual fica destacado.
                    </div>

                    <div className="mt-4 space-y-2">
                      {list.map((e, i) => {
                        const active = i === idx;
                        return (
                          <div
                            key={e.id || i}
                            className={`p-3 rounded-xl border transition ${
                              active
                                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTs(e.ts)} • {e.actor || "sistema"}
                                </div>
                                <div className={`text-sm ${active ? "font-semibold text-gray-900 dark:text-white" : "text-gray-900 dark:text-gray-100"}`}>
                                  [{e.type}] {e.message}
                                </div>
                              </div>

                              <button
                                onClick={() => setIdx(i)}
                                className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-xs"
                              >
                                Ir
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Dica pra LinkedIn: ligue o <b>Demo Mode</b>, faça 5 ações (import, mover status no Kanban, registrar contato)
                    e grave o Playback.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
            Playback Mode ativo ✅
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaybackModal;
