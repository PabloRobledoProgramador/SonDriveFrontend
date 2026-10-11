import { describe, expect, it } from "vitest";
import { esquemaCrearConductor, esquemaEditarConductor } from "./esquemas";

const datosValidos = {
  nombre: "Carlos",
  apellido: "Gómez",
  correo: "carlos@sondrive.com",
  celular: "3001234567",
  foto: "",
};

function mensajes(datos: Record<string, unknown>): string[] {
  const resultado = esquemaEditarConductor.safeParse(datos);
  return resultado.success
    ? []
    : resultado.error.issues.map((problema) => problema.message);
}

describe("esquemaEditarConductor", () => {
  it("acepta datos válidos sin foto", () => {
    expect(mensajes(datosValidos)).toEqual([]);
  });

  it("exige el nombre y los apellidos", () => {
    expect(mensajes({ ...datosValidos, nombre: "   " })).toContain(
      "Escribe el nombre.",
    );
    expect(mensajes({ ...datosValidos, apellido: "" })).toContain(
      "Escribe los apellidos.",
    );
  });

  it("limita el nombre y los apellidos a 100 caracteres", () => {
    expect(mensajes({ ...datosValidos, nombre: "a".repeat(101) })).toContain(
      "El nombre no puede superar los 100 caracteres.",
    );
    expect(mensajes({ ...datosValidos, apellido: "a".repeat(101) })).toContain(
      "Los apellidos no pueden superar los 100 caracteres.",
    );
  });

  it("exige un correo con formato válido y de máximo 150 caracteres", () => {
    expect(mensajes({ ...datosValidos, correo: "no-es-correo" })).toContain(
      "Escribe un correo válido.",
    );
    expect(
      mensajes({ ...datosValidos, correo: `${"a".repeat(139)}@sondrive.com` }),
    ).toContain("El correo no puede superar los 150 caracteres.");
  });

  it.each(["300123456", "2001234567", "30012345678", "abc"])(
    "rechaza el celular %s",
    (celular) => {
      expect(mensajes({ ...datosValidos, celular })).toContain(
        "Usa 10 dígitos y comienza por 3.",
      );
    },
  );

  it.each(["abc", "ftp://servidor/foto.png", "/fotos/carlos.png"])(
    "rechaza la foto %s porque no es una dirección http o https",
    (foto) => {
      expect(mensajes({ ...datosValidos, foto })).toContain(
        "Escribe una URL válida para la foto.",
      );
    },
  );

  it("limita la foto a 500 caracteres", () => {
    expect(
      mensajes({
        ...datosValidos,
        foto: `https://ejemplo.com/${"a".repeat(500)}`,
      }),
    ).toContain("La URL de la foto no puede superar los 500 caracteres.");
  });

  it.each(["http://ejemplo.com/foto.png", "https://ejemplo.com/foto.png"])(
    "acepta la foto %s",
    (foto) => {
      expect(mensajes({ ...datosValidos, foto })).toEqual([]);
    },
  );

  it("recorta los textos antes de validar", () => {
    const resultado = esquemaEditarConductor.parse({
      nombre: "  Carlos ",
      apellido: " Gómez  ",
      correo: " carlos@sondrive.com ",
      celular: " 3001234567 ",
      foto: "  ",
    });

    expect(resultado).toEqual(datosValidos);
  });

  it("no incluye la contraseña aunque llegue en los datos", () => {
    const resultado = esquemaEditarConductor.parse({
      ...datosValidos,
      clave: "ClaveSegura123",
    });

    expect(resultado).not.toHaveProperty("clave");
  });
});

describe("esquemaCrearConductor", () => {
  it("sigue exigiendo una contraseña de 8 a 72 caracteres", () => {
    const conClave = (clave: string) =>
      esquemaCrearConductor.safeParse({ ...datosValidos, clave }).success;

    expect(conClave("1234567")).toBe(false);
    expect(conClave("12345678")).toBe(true);
    expect(conClave("x".repeat(72))).toBe(true);
    expect(conClave("x".repeat(73))).toBe(false);
    expect(esquemaCrearConductor.safeParse(datosValidos).success).toBe(false);
  });

  it("comparte con la edición la regla de la foto", () => {
    const resultado = esquemaCrearConductor.safeParse({
      ...datosValidos,
      clave: "ClaveSegura123",
      foto: "ftp://servidor/foto.png",
    });

    expect(resultado.success).toBe(false);
  });
});
