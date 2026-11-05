import { describe, expect, it } from "vitest";
import { esquemaVehiculo, type DatosFormularioVehiculo } from "./esquemas";

// Fechas relativas a hoy: el esquema lee el reloj
const fechaLocal = (dias: number) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toLocaleDateString("sv-SE");
};

const datosValidos: DatosFormularioVehiculo = {
  idUsuario: "2",
  placa: "ABC123",
  modelo: "Kia Rio",
  annoModelo: "2022",
  tipo: "Sedan",
  kilometraje: "48200",
  fechaUltimoServicio: fechaLocal(-30),
  vencimientoSoat: fechaLocal(200),
  vencimientoTecnomecanica: fechaLocal(300),
  vencimientoLicencia: fechaLocal(400),
};

function mensajes(cambios: Partial<DatosFormularioVehiculo>): string[] {
  const resultado = esquemaVehiculo.safeParse({ ...datosValidos, ...cambios });
  return resultado.success
    ? []
    : resultado.error.issues.map((problema) => problema.message);
}

describe("esquemaVehiculo", () => {
  it("acepta datos válidos", () => {
    expect(mensajes({})).toEqual([]);
  });

  it("exige el conductor", () => {
    expect(mensajes({ idUsuario: "" })).toContain("Elige el conductor.");
  });

  it("rechaza una placa con formato incorrecto", () => {
    expect(mensajes({ placa: "AB12" })).toContain(
      "Usa el formato de placa ABC 123.",
    );
  });

  it("acepta la placa en minúsculas y con espacio, y la devuelve en mayúsculas", () => {
    const resultado = esquemaVehiculo.safeParse({
      ...datosValidos,
      placa: "abc 123",
    });

    expect(resultado.success).toBe(true);
    expect(resultado.data?.placa).toBe("ABC 123");
  });

  it("exige el modelo y limita su longitud", () => {
    expect(mensajes({ modelo: "   " })).toContain("Escribe el modelo.");
    expect(mensajes({ modelo: "a".repeat(101) })).toContain(
      "El modelo no puede superar los 100 caracteres.",
    );
  });

  it("exige un año de cuatro dígitos dentro del rango", () => {
    expect(mensajes({ annoModelo: "22" })).toContain(
      "El año debe tener 4 dígitos.",
    );
    expect(mensajes({ annoModelo: "1989" })).toContain(
      "El año del modelo no es válido.",
    );
    expect(
      mensajes({ annoModelo: String(new Date().getFullYear() + 2) }),
    ).toContain("El año del modelo no es válido.");
    expect(
      mensajes({ annoModelo: String(new Date().getFullYear() + 1) }),
    ).toEqual([]);
  });

  it("exige el tipo de vehículo", () => {
    expect(mensajes({ tipo: "" })).toContain("Elige el tipo de vehículo.");
  });

  it("rechaza un kilometraje negativo o con decimales", () => {
    const mensaje = "Escribe un kilometraje igual o mayor que cero.";
    expect(mensajes({ kilometraje: "-5" })).toContain(mensaje);
    expect(mensajes({ kilometraje: "12.5" })).toContain(mensaje);
    expect(mensajes({ kilometraje: "0" })).toEqual([]);
  });

  it("no acepta un último servicio futuro, pero sí vacío", () => {
    expect(mensajes({ fechaUltimoServicio: fechaLocal(1) })).toContain(
      "La fecha del último servicio no puede ser futura.",
    );
    expect(mensajes({ fechaUltimoServicio: "" })).toEqual([]);
    expect(mensajes({ fechaUltimoServicio: fechaLocal(0) })).toEqual([]);
  });

  it("exige los tres vencimientos", () => {
    expect(mensajes({ vencimientoSoat: "" })).toContain(
      "Indica el vencimiento del SOAT.",
    );
    expect(mensajes({ vencimientoTecnomecanica: "" })).toContain(
      "Indica el vencimiento de la tecnomecánica.",
    );
    expect(mensajes({ vencimientoLicencia: "" })).toContain(
      "Indica el vencimiento de la licencia.",
    );
  });

  it("rechaza una fecha que no existe", () => {
    expect(mensajes({ vencimientoSoat: "2026-02-31" })).toContain(
      "Indica una fecha válida.",
    );
  });

  it("acepta un vencimiento pasado", () => {
    expect(mensajes({ vencimientoSoat: fechaLocal(-1) })).toEqual([]);
  });
});
