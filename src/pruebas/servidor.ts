import { setupServer } from "msw/node";
import { manejadores } from "./manejadores";

// Servidor MSW que simula la API de SonDrive en las pruebas
export const servidor = setupServer(...manejadores);
