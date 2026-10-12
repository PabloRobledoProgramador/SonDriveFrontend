import type { FieldErrors, UseFormRegister } from "react-hook-form";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import CampoSelect from "../../../components/ui/CampoSelect";
import type { DatosFormularioVehiculo } from "../esquemas";

const hoy = () => new Date().toLocaleDateString("sv-SE");

// Los diez datos de un vehículo. Los comparten el alta y la edición.
export default function CamposVehiculo({
  register,
  errors,
  conductores,
  conductoresDeshabilitado,
  textoSinSeleccion,
  tiposAdicionales = [],
}: {
  register: UseFormRegister<DatosFormularioVehiculo>;
  errors: FieldErrors<DatosFormularioVehiculo>;
  // Opciones ya armadas del conductor asignado
  conductores: { id: number; nombre: string }[];
  conductoresDeshabilitado: boolean;
  // Texto de la opción vacía; sin él no hay opción vacía (la edición siempre tiene conductor)
  textoSinSeleccion?: string;
  // Tipos guardados que no están entre los cuatro de la lista
  tiposAdicionales?: string[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoSelect
          etiqueta="Conductor asignado"
          disabled={conductoresDeshabilitado}
          error={errors.idUsuario?.message}
          {...register("idUsuario")}
        >
          {textoSinSeleccion !== undefined && (
            <option value="">{textoSinSeleccion}</option>
          )}
          {conductores.map((conductor) => (
            <option key={conductor.id} value={conductor.id}>
              {conductor.nombre}
            </option>
          ))}
        </CampoSelect>
        <CampoFormulario
          etiqueta="Placa"
          autoCapitalize="characters"
          placeholder="ABC 123"
          maxLength={7}
          error={errors.placa?.message}
          {...register("placa")}
        />
        <CampoFormulario
          etiqueta="Modelo del vehículo"
          placeholder="Renault Logan"
          maxLength={100}
          error={errors.modelo?.message}
          {...register("modelo")}
        />
        <CampoFormulario
          etiqueta="Año del modelo"
          type="number"
          min="1990"
          max={new Date().getFullYear() + 1}
          error={errors.annoModelo?.message}
          {...register("annoModelo")}
        />
        <CampoSelect
          etiqueta="Tipo de vehículo"
          error={errors.tipo?.message}
          {...register("tipo")}
        >
          <option value="">Selecciona</option>
          <option value="Sedan">Sedán</option>
          <option value="Hatchback">Hatchback</option>
          <option value="SUV">SUV</option>
          <option value="Pickup">Pickup</option>
          {tiposAdicionales.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </CampoSelect>
        <CampoFormulario
          etiqueta="Kilometraje actual"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          error={errors.kilometraje?.message}
          {...register("kilometraje")}
        />
      </div>

      <div className="rounded-xl border border-borde bg-elevada/50 p-4">
        <h3 className="mb-3 text-sm font-semibold">Documentos y servicio</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoFormulario
            etiqueta="Vencimiento SOAT"
            type="date"
            error={errors.vencimientoSoat?.message}
            {...register("vencimientoSoat")}
          />
          <CampoFormulario
            etiqueta="Vencimiento tecnomecánica"
            type="date"
            error={errors.vencimientoTecnomecanica?.message}
            {...register("vencimientoTecnomecanica")}
          />
          <CampoFormulario
            etiqueta="Vencimiento licencia de conducción"
            type="date"
            error={errors.vencimientoLicencia?.message}
            {...register("vencimientoLicencia")}
          />
          <CampoFormulario
            etiqueta="Fecha del último servicio (opcional)"
            type="date"
            max={hoy()}
            error={errors.fechaUltimoServicio?.message}
            {...register("fechaUltimoServicio")}
          />
        </div>
      </div>
    </>
  );
}
