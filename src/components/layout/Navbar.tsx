const links = [
  { href: "/", label: "Inicio" },
  { href: "/rutas", label: "Rutas" },
  { href: "/conductores", label: "Conductores" },
  { href: "/vehiculos", label: "Vehículos" },
  { href: "/mis-viajes", label: "Mis Viajes" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-borde bg-fondo">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" className="font-titulo text-lg font-semibold text-marca">
          SonDrive
        </a>

        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-texto-suave transition-colors hover:bg-divisor hover:text-marca"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex gap-2">
          <button className="rounded-lg border border-borde px-4 py-2 text-sm font-medium text-texto-suave transition-colors hover:border-marca hover:text-marca">
            Iniciar sesión
          </button>
          <button className="rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-fondo transition-colors hover:bg-marca-oscuro">
            Registrarse
          </button>
        </div>
      </div>
    </header>
  );
}
