interface AulaCalloutProps {
  children: React.ReactNode;
  tipo?: "info" | "sucesso" | "alerta";
}

const estilos = {
  info: "border-[var(--color-primary)] bg-[var(--color-primary)]/5",
  sucesso: "border-[var(--color-success)] bg-[var(--color-success)]/5",
  alerta: "border-[var(--color-warning)] bg-[var(--color-warning)]/5",
};

export function AulaCallout({ children, tipo = "info" }: AulaCalloutProps) {
  return (
    <div className={`border-l-4 rounded-r-lg px-5 py-4 my-4 ${estilos[tipo]}`}>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
