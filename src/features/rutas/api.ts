import { solicitar } from "../../lib/clienteHttp";
import type { Ruta } from "./tipos";

export function listarRutas(): Promise<Ruta[]> {
  return solicitar<Ruta[]>("/api/ruta");
}
