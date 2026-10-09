import { useEffect, useRef, useState, type ReactNode } from "react";

type Origen = "abajo" | "izquierda" | "derecha";

interface PropiedadesAparecer {
  desde?: Origen;
  retraso?: number;
  className?: string;
  children: ReactNode;
}

const posicionInicial: Record<Origen, string> = {
  abajo: "translate-y-9",
  izquierda: "-translate-x-10",
  derecha: "translate-x-10",
};

export default function Aparecer({
  desde = "abajo",
  retraso = 0,
  className = "",
  children,
}: PropiedadesAparecer) {
  const referencia = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento || typeof IntersectionObserver === "undefined") return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  const estado = visible
    ? "translate-x-0 translate-y-0 opacity-100"
    : `${posicionInicial[desde]} opacity-0 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100`;

  return (
    <div
      ref={referencia}
      style={retraso > 0 ? { transitionDelay: `${retraso}ms` } : undefined}
      className={`transition duration-700 ease-out motion-reduce:transition-none ${estado} ${className}`}
    >
      {children}
    </div>
  );
}
