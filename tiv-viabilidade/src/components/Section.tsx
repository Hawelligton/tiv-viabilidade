import { ReactNode } from "react";

export function Section({
  numero,
  titulo,
  descricao,
  children,
  action,
}: {
  numero: string;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-grafite-700 bg-grafite-900/60 p-5 sm:p-7">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl italic text-ferrugem-500">
            {numero}
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold leading-tight text-papel-50 sm:text-2xl">
              {titulo}
            </h2>
            {descricao && (
              <p className="mt-1 max-w-2xl text-sm text-grafite-300">
                {descricao}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
