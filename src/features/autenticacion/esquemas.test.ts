import { describe, expect, it } from "vitest";
import { esquemaInicioSesion } from "./esquemas";

function errores(correo: string, clave: string): string[] {
  const resultado = esquemaInicioSesion.safeParse({ correo, clave });
  return resultado.success ? [] : resultado.error.issues.map((problema) => problema.message);
}

// Mismas reglas y mensajes que InicioSesionDtoValidador del backend (principio III)
describe("esquemaInicioSesion", () => {
  it("correo vacío", () => {
    expect(errores("", "Clave12345*")).toContain("El correo es obligatorio.");
  });

  it("correo con formato inválido", () => {
    expect(errores("no-es-un-correo", "Clave12345*")).toContain("El correo no tiene un formato válido.");
  });

  it("correo de 151 caracteres", () => {
    expect(errores("a".repeat(139) + "@sondrive.com", "Clave12345*")).toContain(
      "El correo no puede superar los 150 caracteres.",
    );
  });

  it("clave vacía", () => {
    expect(errores("admin@sondrive.com", "")).toContain("La clave es obligatoria.");
  });

  it("clave de 73 caracteres", () => {
    expect(errores("admin@sondrive.com", "x".repeat(73))).toContain(
      "La clave no puede superar los 72 caracteres.",
    );
  });

  it("datos válidos, con el correo recortado", () => {
    const resultado = esquemaInicioSesion.safeParse({ correo: "  admin@sondrive.com ", clave: "Admin12345*" });

    expect(resultado.success).toBe(true);
    expect(resultado.data?.correo).toBe("admin@sondrive.com");
  });
});
