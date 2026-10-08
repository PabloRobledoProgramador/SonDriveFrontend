import type { ReactNode } from "react";

type Tono = "marca" | "exito" | "aviso" | "peligro";

// Tintes con color base + opacidad (regla de index.css)
const estilosTono: Record<Tono, string> = {
  marca: "border-marca/20 bg-marca/10 text-marca",
  exito: "border-exito/20 bg-exito/10 text-exito",
  aviso: "border-aviso/20 bg-aviso/10 text-aviso",
  peligro: "border-peligro/20 bg-peligro/10 text-peligro",
};

export default function Insignia({ tono = "marca", children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${estilosTono[tono]}`}
    >
      {children}
    </span>
  );
}
