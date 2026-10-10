// Tabla única de secciones del sitio: de ella salen las rutas y los enlaces de navegación
// (FR-014, FR-017). Cada módulo nuevo agrega aquí sus secciones con el acceso de la matriz de la
// constitución (principio IV).
import { lazy, type ComponentType } from "react";
import {
  cargarPaginaIniciarSesion,
  cargarPaginaRegistro,
  type Rol,
} from "../features/autenticacion";
import { cargarPaginaInicio } from "../features/inicio";
import { cargarPaginaRutas } from "../features/rutas";
import { cargarPaginaMisViajes } from "../features/viajes";
import { cargarPaginaVehiculos } from "../features/vehiculos";
import { cargarPaginaConductores } from "../features/conductores";

export type AccesoSeccion = "publico" | "soloVisitantes" | Rol[];

export interface Seccion {
  ruta: string;
  nombre: string;
  acceso: AccesoSeccion;
  enNavegacion: boolean;
  pagina: ComponentType;
}

export const secciones: Seccion[] = [
  {
    ruta: "/",
    nombre: "Inicio",
    acceso: "publico",
    enNavegacion: true,
    pagina: lazy(cargarPaginaInicio),
  },
  {
    ruta: "/rutas",
    nombre: "Rutas",
    acceso: "publico",
    enNavegacion: true,
    pagina: lazy(cargarPaginaRutas),
  },
  {
    ruta: "/conductor",
    nombre: "Mis viajes",
    acceso: ["Conductor"],
    enNavegacion: true,
    pagina: lazy(cargarPaginaMisViajes),
  },
  {
    ruta: "/vehiculos",
    nombre: "Vehículos",
    acceso: ["Administrador"],
    enNavegacion: true,
    pagina: lazy(cargarPaginaVehiculos),
  },
  {
    ruta: "/conductores",
    nombre: "Conductores",
    acceso: ["Administrador"],
    enNavegacion: true,
    pagina: lazy(cargarPaginaConductores),
  },
  {
    ruta: "/iniciar-sesion",
    nombre: "Iniciar sesión",
    acceso: "soloVisitantes",
    enNavegacion: false,
    pagina: lazy(cargarPaginaIniciarSesion),
  },
  {
    ruta: "/registrarse",
    nombre: "Registrarse",
    acceso: "soloVisitantes",
    enNavegacion: false,
    pagina: lazy(cargarPaginaRegistro),
  },
  // Debe ir al final: cualquier dirección que no coincida con las anteriores (FR-021)
  {
    ruta: "*",
    nombre: "Página no encontrada",
    acceso: "publico",
    enNavegacion: false,
    pagina: lazy(() => import("./PaginaNoEncontrada")),
  },
];
