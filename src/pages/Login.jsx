import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@smartcollect.com");
  const [senha, setSenha] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = login(email, senha);
      if (!res?.ok) {
        setError(res?.error || "Não foi possível autenticar.");
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Erro inesperado ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-black">
      {/* Background premium */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Painel esquerdo (apresentação) */}
          <div className="hidden lg:flex rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-xl
                          dark:bg-gray-950/60 dark:border-gray-800 p-8">
            <div className="flex flex-col justify-between w-full">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 bg-white/70
                                dark:bg-gray-950/70 dark:border-gray-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Plataforma de Cobrança • Operador + Gestor
                  </span>
                </div>

                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Smart<span className="text-blue-600">Collect</span>
                </h1>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Uma interface de cobrança com padrão de sistema corporativo:
                  carteira, promessas, auditoria e analytics — pronta para demo e portfólio.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { t: "Prioridade e SLA", s: "Fila inteligente" },
                    { t: "Promessas (PDP)", s: "Controle e cobrança" },
                    { t: "Auditoria", s: "Ações rastreáveis" },
                    { t: "Analytics", s: "Visão executiva" },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="p-4 rounded-2xl border border-gray-200 bg-white
                                 dark:bg-gray-950 dark:border-gray-800"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400">Destaque</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{x.t}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{x.s}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">Dica de demo:</span>{" "}
                faça login e mostre Dashboard + Carteira + Analytics.
              </div>
            </div>
          </div>

          {/* Card de login */}
          <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-2xl
                          dark:bg-gray-950/70 dark:border-gray-800 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg flex items-center justify-center">
                  <span className="text-white font-extrabold text-lg">SC</span>
                </div>
                <div className="leading-tight">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Acesso ao</div>
                  <div className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Smart<span className="text-blue-600">Collect</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Entre com seu e-mail e senha autorizados.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">E-mail</div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@smartcollect.com"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900
                             dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800
                             focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Senha</div>
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {showPass ? "Ocultar" : "Ver"}
                  </button>
                </div>

                <input
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900
                             dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800
                             focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                />
              </div>

              {error && (
                <div className="p-3 rounded-2xl border border-red-200 bg-red-50 text-red-700
                                dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600
                           text-white font-semibold shadow-lg hover:opacity-95 transition disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1">
                <span>🔒 Sessão local (demo)</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">v0.1</span>
              </div>

              <div className="mt-2 p-4 rounded-2xl border border-gray-200 bg-gray-50
                              dark:bg-gray-900 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  Admin padrão:
                </div>
                <div>📧 admin@smartcollect.com</div>
                <div>🔑 admin123</div>
              </div>
            </form>

            <div className="px-6 sm:px-8 py-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} SmartCollect • Gestão de cobrança
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
