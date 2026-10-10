import type { ComponentProps } from "react";

// ComponentProps<"div"> incluye ref (React 19), que usa el Modal para mover el foco
interface PropiedadesTarjeta extends ComponentProps<"div"> {
  sinRelleno?: boolean;
}

export default function Tarjeta({
  className = "",
  sinRelleno = false,
  ...resto
}: PropiedadesTarjeta) {
  return (
    <div
      className={`rounded-2xl border border-borde bg-tarjeta ${sinRelleno ? "" : "p-6"} ${className}`}
      {...resto}
    />
  );
}
