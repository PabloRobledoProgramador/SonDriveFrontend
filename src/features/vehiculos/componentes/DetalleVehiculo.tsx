import type { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import Insignia from "../../../components/ui/Insignia";
import Tarjeta from "../../../components/ui/Tarjeta";
import type { ErrorApi } from "../../../lib/errores";
import { useCambiarFallaResuelta } from "../consultas";
import {
  estadoDocumento,
  estadoVehiculo,
  type EstadoVehiculo,
} from "../estadoVehiculo";
import FormularioReportarFalla from "./FormularioReportarFalla";
import type {
  FallaVehiculo,
  VehiculoFlota,
} from "../tipos";

const TONO_ESTADO: Record<EstadoVehiculo, "peligro" | "aviso" | "exito"> = {
  critico: "peligro",
  alerta: "aviso",
  optimo: "exito",
};

const ETIQUETA_ESTADO: Record<EstadoVehiculo, string> = {
  critico: "Acción urgente",
  alerta: "Requiere atención",
  optimo: "Sin alertas",
};

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "Sin registro";
  const valor = fecha.slice(0, 10);
  const fechaLocal = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(fechaLocal.getTime())) return "Sin registro";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fechaLocal);
}

function textoVencimiento(dias: number): string {
  if (dias < 0) return `Venció hace ${Math.abs(dias)} días`;
  if (dias === 0) return "Vence hoy";
  if (dias <= 30) return `Vence en ${dias} días`;
  return `${dias} días restantes`;
}

function Documento({
  nombre,
  documento,
}: {
  nombre: string;
  documento: VehiculoFlota["soat"];
}) {
  const estado = estadoDocumento(documento);
  const tono = TONO_ESTADO[estado];
  const claseTexto = {
    critico: "text-peligro",
    alerta: "text-aviso",
    optimo: "text-exito",
  }[estado];

  return (
    <div
      className={`rounded-xl border p-4 ${
        estado === "critico"
          ? "border-peligro/20 bg-peligro/5"
          : estado === "alerta"
            ? "border-aviso/20 bg-aviso/5"
            : "border-exito/20 bg-exito/5"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-texto-suave">{nombre}</p>
        <Insignia tono={tono} className="px-2 py-0.5">
          <span className="sr-only">{ETIQUETA_ESTADO[estado]}</span>
          <span aria-hidden="true" className="size-2 rounded-full bg-current" />
        </Insignia>
      </div>
      <p className={`text-sm font-semibold ${claseTexto}`}>
        {formatearFecha(documento.vencimiento)}
      </p>
      <p className={`mt-1 text-xs ${claseTexto}`}>
        {textoVencimiento(documento.diasRestantes)}
      </p>
    </div>
  );
}

function tonoFalla(severidad: FallaVehiculo["severidad"]) {
  if (severidad === "Crítico") return "peligro" as const;
  if (severidad === "Alerta") return "aviso" as const;
  return "marca" as const;
}

function colorFalla(severidad: FallaVehiculo["severidad"]) {
  if (severidad === "Crítico") return "bg-peligro";
  if (severidad === "Alerta") return "bg-aviso";
  return "bg-info";
}

export default function DetalleVehiculo({
  vehiculo,
  consultaFallas,
}: {
  vehiculo: VehiculoFlota;
  consultaFallas: UseQueryResult<FallaVehiculo[], ErrorApi>;
}) {
  const estado = estadoVehiculo(vehiculo);
  const [reportando, setReportando] = useState(false);
  const cambiarResuelta = useCambiarFallaResuelta(vehiculo.id);

  const fallasAbiertas =
    consultaFallas.data?.filter((falla) => !falla.estaResuelta) ?? [];
  const fallasResueltas =
    consultaFallas.data?.filter((falla) => falla.estaResuelta) ?? [];
  const fallasOrdenadas = [...fallasAbiertas, ...fallasResueltas];

  return (
    <div className="flex flex-col gap-4">
      <Tarjeta className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-marca/20 bg-marca/10 text-2xl"
            >
              🚘
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold">{vehiculo.nombreVehiculo}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-texto-tenue">
                {vehiculo.fotoConductor ? (
                  <img
                    src={vehiculo.fotoConductor}
                    alt=""
                    className="size-5 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-5 items-center justify-center rounded-full bg-elevada text-[10px] text-marca"
                  >
                    {vehiculo.conductor.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span>{vehiculo.conductor}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium tracking-wide text-marca">
                  {vehiculo.placa}
                </span>
              </div>
            </div>
          </div>
          <Insignia tono={TONO_ESTADO[estado]}>{ETIQUETA_ESTADO[estado]}</Insignia>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-divisor pt-4">
          <div>
            <p className="text-xs text-texto-tenue">Kilometraje actual</p>
            <p className="mt-1 text-xl font-semibold">
              {vehiculo.kilometraje.toLocaleString("es-CO")}{" "}
              <span className="text-sm font-normal text-texto-tenue">km</span>
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-texto-tenue">Último servicio</p>
            <p className="mt-1 text-sm font-medium">
              {formatearFecha(vehiculo.fechaUltimoServicio)}
            </p>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta className="p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold">Documentación</h3>
          <p className="text-xs text-texto-tenue">
            Fechas de vencimiento registradas
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Documento nombre="SOAT" documento={vehiculo.soat} />
          <Documento
            nombre="Revisión tecnomecánica"
            documento={vehiculo.tecnomecanica}
          />
          <Documento
            nombre="Licencia de conducción"
            documento={vehiculo.licencia}
          />
        </div>
      </Tarjeta>

      <Tarjeta className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Registro de fallas</h3>
            <p className="mt-1 text-xs text-texto-tenue">
              {fallasAbiertas.length
                ? `${fallasAbiertas.length} sin resolver`
                : "Sin fallas pendientes"}
            </p>
          </div>
          <Boton
            compacto
            variante={reportando ? "secundario" : "principal"}
            aria-expanded={reportando}
            onClick={() => setReportando((abierto) => !abierto)}
          >
            {reportando ? "Cancelar" : "＋ Reportar falla"}
          </Boton>
        </div>

        {reportando && (
          <FormularioReportarFalla
            idVehiculo={vehiculo.id}
            alCancelar={() => setReportando(false)}
            alReportar={() => setReportando(false)}
          />
        )}

        {cambiarResuelta.isError && (
          <div className="mt-4">
            <Aviso tipo="error">{cambiarResuelta.error.mensaje}</Aviso>
          </div>
        )}
        {consultaFallas.isPending && (
          <EstadoCargando texto="Cargando registro de fallas…" />
        )}
        {consultaFallas.isError && (
          <div className="mt-4">
            <EstadoError
              error={consultaFallas.error}
              alReintentar={() => void consultaFallas.refetch()}
            />
          </div>
        )}
        {consultaFallas.isSuccess && fallasOrdenadas.length === 0 && (
          <p className="mt-4 rounded-xl border border-exito/20 bg-exito/5 px-4 py-3 text-sm text-exito">
            No hay fallas registradas para este vehículo.
          </p>
        )}
        {consultaFallas.isSuccess && fallasOrdenadas.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {fallasOrdenadas.map((falla) => (
              <li
                key={falla.id}
                className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border p-3.5 ${
                  falla.estaResuelta
                    ? "border-borde bg-elevada/40 opacity-60"
                    : "border-borde bg-elevada"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 size-2.5 shrink-0 rounded-full ${colorFalla(falla.severidad)}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed">{falla.descripcion}</p>
                    <p className="mt-1 text-xs text-texto-tenue">
                      Reportada: {formatearFecha(falla.fecha)}
                      {falla.estaResuelta ? " · Resuelta" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Insignia tono={tonoFalla(falla.severidad)}>
                    {falla.severidad}
                  </Insignia>
                  {!falla.estaResuelta && (
                    <Boton
                      compacto
                      variante="secundario"
                      disabled={cambiarResuelta.isPending}
                      cargando={
                        cambiarResuelta.isPending &&
                        cambiarResuelta.variables?.id === falla.id
                      }
                      onClick={() =>
                        cambiarResuelta.mutate({
                          id: falla.id,
                          resuelta: true,
                        })
                      }
                    >
                      Resolver
                    </Boton>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
