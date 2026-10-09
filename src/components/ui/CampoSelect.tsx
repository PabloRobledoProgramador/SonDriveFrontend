import { useId, type Ref, type SelectHTMLAttributes } from "react";

interface PropiedadesSelect extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  error?: string;
  ref?: Ref<HTMLSelectElement>;
}

// Igual que CampoFormulario pero para listas desplegables. Acepta las props de register().
export default function CampoSelect({
  etiqueta,
  error,
  id,
  className = "",
  ref,
  children,
  ...resto
}: PropiedadesSelect) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idError = `${idCampo}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={idCampo}
        className="text-xs font-medium uppercase tracking-wide text-texto-tenue"
      >
        {etiqueta}
      </label>
      <select
        ref={ref}
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`min-h-11 rounded-lg border bg-elevada px-3 text-sm text-texto focus:outline-none focus:ring-2 focus:ring-marca ${
          error ? "border-peligro" : "border-borde"
        } ${className}`}
        {...resto}
      >
        {children}
      </select>
      {error && (
        <p id={idError} className="text-xs text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}
