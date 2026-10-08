// Mensaje común cuando una consulta no devuelve resultados; cada sección pone su propio texto
export default function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-2xl border border-borde bg-tarjeta px-6 py-10 text-center text-sm text-texto-tenue">
      {mensaje}
    </div>
  );
}
