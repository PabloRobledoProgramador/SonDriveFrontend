import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import CampoSelect from "../../../components/ui/CampoSelect";
import Tarjeta from "../../../components/ui/Tarjeta";
import { useCiudades } from "../consultas";
import { esquemaBuscarViaje, type DatosBuscarViaje } from "../esquemas";
import { parametrosDesdeFiltro } from "../parametros";

export default function FormularioBuscarViaje() {
  const [parametros, setParametros] = useSearchParams();
  const ciudades = useCiudades();
  const hoy = new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD en hora local

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosBuscarViaje>({
    resolver: zodResolver(esquemaBuscarViaje),
    defaultValues: {
      origenId: parametros.get("origen") ?? "",
      destinoId: parametros.get("destino") ?? "",
      fecha: parametros.get("fecha") ?? "",
    },
  });

  const buscar = (datos: DatosBuscarViaje) => {
    setParametros(
      parametrosDesdeFiltro({
        origenId: datos.origenId,
        destinoId: datos.destinoId,
        fecha: datos.fecha,
      }),
    );
  };

  const alEnviar = (evento: FormEvent<HTMLFormElement>) => handleSubmit(buscar)(evento);

  const opciones = ciudades.data ?? [];
  const sinCiudades = ciudades.isPending || ciudades.isError;

  return (
    <Tarjeta className="bg-tarjeta/90 backdrop-blur-sm">
      <h2 className="mb-4 text-lg font-semibold text-texto">Buscar viaje</h2>

      <form onSubmit={alEnviar} noValidate className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-start">
        <CampoSelect etiqueta="Origen" disabled={sinCiudades} error={errors.origenId?.message} {...register("origenId")}>
          <option value="">{ciudades.isPending ? "Cargando…" : "Selecciona"}</option>
          {opciones.map((ciudad) => (
            <option key={ciudad.id} value={ciudad.id}>
              {ciudad.nombre}
            </option>
          ))}
        </CampoSelect>

        <CampoSelect etiqueta="Destino" disabled={sinCiudades} error={errors.destinoId?.message} {...register("destinoId")}>
          <option value="">{ciudades.isPending ? "Cargando…" : "Selecciona"}</option>
          {opciones.map((ciudad) => (
            <option key={ciudad.id} value={ciudad.id}>
              {ciudad.nombre}
            </option>
          ))}
        </CampoSelect>

        <CampoFormulario etiqueta="Fecha (opcional)" type="date" min={hoy} {...register("fecha")} />

        {/* Etiqueta invisible para que el botón quede alineado con los campos */}
        <div className="flex flex-col gap-1.5">
          <span aria-hidden="true" className="hidden text-xs md:block">
            &nbsp;
          </span>
          <Boton type="submit" anchoCompleto disabled={sinCiudades}>
            Buscar viajes
          </Boton>
        </div>
      </form>

      {ciudades.isError && (
        <p role="alert" className="mt-3 text-sm text-peligro">
          {ciudades.error.mensaje}{" "}
          <button type="button" onClick={() => ciudades.refetch()} className="underline">
            Reintentar
          </button>
        </p>
      )}
    </Tarjeta>
  );
}