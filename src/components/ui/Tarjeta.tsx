import type { HTMLAttributes } from "react";

export default function Tarjeta({ className = "", ...resto }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border border-borde bg-tarjeta p-6 ${className}`} {...resto} />;
}
