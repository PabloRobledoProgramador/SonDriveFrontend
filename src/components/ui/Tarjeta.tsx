import type { ComponentProps } from "react";

// ComponentProps<"div"> incluye ref (React 19), que usa el Modal para mover el foco
export default function Tarjeta({ className = "", ...resto }: ComponentProps<"div">) {
  return <div className={`rounded-2xl border border-borde bg-tarjeta p-6 ${className}`} {...resto} />;
}
