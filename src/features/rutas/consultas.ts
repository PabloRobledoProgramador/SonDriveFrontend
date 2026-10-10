import { useQuery } from "@tanstack/react-query";
import type { ErrorApi } from "../../lib/errores";
import * as api from "./api";
import type { Ruta } from "./tipos";

export function useRutas() {
  return useQuery<Ruta[], ErrorApi>({
    queryKey: ["rutas"],
    queryFn: api.listarRutas,
    staleTime: 10 * 60 * 1000, // las rutas casi no cambian
  });
}
