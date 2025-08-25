// src/utils/numeroALetras.js

export function numeroALetras(numero) {
  if (numero == null) return "";

  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince",
    "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  ];
  const decenas = [
    "", "", "veinte", "treinta", "cuarenta", "cincuenta",
    "sesenta", "setenta", "ochenta", "noventa",
  ];
  const centenas = [
    "", "cien", "doscientos", "trescientos", "cuatrocientos",
    "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos",
  ];

  function convertirCentenas(n) {
    if (n < 20) return unidades[n];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      return decenas[d] + (u ? " y " + unidades[u] : "");
    }
    if (n < 1000) {
      const c = Math.floor(n / 100);
      const resto = n % 100;
      if (n === 100) return "cien";
      return centenas[c] + (resto ? " " + convertirCentenas(resto) : "");
    }
    return "";
  }

  function convertirMiles(n) {
    if (n < 1000) return convertirCentenas(n);
    if (n < 1000000) {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;
      const milesTexto = miles === 1 ? "mil" : convertirCentenas(miles) + " mil";
      return milesTexto + (resto ? " " + convertirCentenas(resto) : "");
    }
    if (n < 1000000000) {
      const millones = Math.floor(n / 1000000);
      const resto = n % 1000000;
      const millonTexto = millones === 1 ? "un millón" : convertirCentenas(millones) + " millones";
      return millonTexto + (resto ? " " + convertirMiles(resto) : "");
    }
    return "";
  }

  const entero = Math.floor(numero);
  const decimales = Math.round((numero - entero) * 100);

  let texto = convertirMiles(entero) + " pesos";
  if (decimales > 0) {
    texto += ` con ${decimales}/100`;
  }

  return texto.trim();
}
