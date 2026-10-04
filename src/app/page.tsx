import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expirada?: string }>;
}) {
  if (await isAuthenticated()) redirect("/app");
  const params = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-5xl shadow-[0_20px_50px_-15px_rgba(212,175,55,0.8)]">
            💰
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">
            Meu Plano Financeiro
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Acesso exclusivo · Dados protegidos
          </p>
        </div>

        {params.expirada ? (
          <p className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-200">
            Sessão expirada por inatividade. Entre novamente.
          </p>
        ) : null}

        <LoginForm />

        <p className="mt-6 text-center text-xs text-slate-600">
          Aplicativo privado · v2.0 Premium
        </p>
      </div>
    </main>
  );
}
