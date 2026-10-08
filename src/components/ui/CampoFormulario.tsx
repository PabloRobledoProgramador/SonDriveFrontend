import { useId, type InputHTMLAttributes, type Ref } from "react";

interface PropiedadesCampo extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

// Campo con etiqueta y mensaje de error accesible. Acepta las props de register() de React Hook Form.
export default function CampoFormulario({ etiqueta, error, id, className = "", ref, ...resto }: PropiedadesCampo) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idError = `${idCampo}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idCampo} className="text-xs font-medium uppercase tracking-wide text-texto-tenue">
        {etiqueta}
      </label>
      <input
        ref={ref}
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`min-h-11 rounded-lg border bg-elevada px-3 text-sm text-texto placeholder:text-texto-apagado focus:outline-none focus:ring-2 focus:ring-marca ${
          error ? "border-peligro" : "border-borde"
        } ${className}`}
        {...resto}
      />
      {error && (
        <p id={idError} className="text-xs text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}
