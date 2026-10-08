import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ProveedorSesion } from "../features/autenticacion";

function crearClienteConsultas(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 1 },
      mutations: { retry: 0 },
    },
  });
}

interface PropiedadesProveedores {
  children: ReactNode;
  // Las pruebas pasan su propio cliente sin reintentos
  clienteConsultas?: QueryClient;
}

export default function Proveedores({ children, clienteConsultas }: PropiedadesProveedores) {
  const [cliente] = useState(() => clienteConsultas ?? crearClienteConsultas());

  return (
    <QueryClientProvider client={cliente}>
      <ProveedorSesion>{children}</ProveedorSesion>
    </QueryClientProvider>
  );
}
