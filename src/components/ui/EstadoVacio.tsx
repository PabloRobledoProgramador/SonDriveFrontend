import Tarjeta from "./Tarjeta";

// Mensaje común cuando una consulta no devuelve resultados; cada sección pone su propio texto
export default function EstadoVacio({ mensaje }: { mensaje: string }) {
  return <Tarjeta className="py-10 text-center text-sm text-texto-tenue">{mensaje}</Tarjeta>;
}
