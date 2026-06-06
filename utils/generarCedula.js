const Canvas = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const axios = require("axios");
const path = require("path");

// 🔥 Registrar fuente personalizada
Canvas.registerFont(
  path.join(
    process.cwd(),
    "assets",
    "fonts",
    "NotoSans_Condensed-Black.ttf"
  ),
  {
    family: "NotoSans"
  }
);

module.exports = async ({
  nombre,
  apellido,
  nacimiento,
  sangre,
  provincia,
  cedula,
  avatarUrl,
  fechaEmision,
  fechaExpiracion
}) => {

  const canvas = Canvas.createCanvas(
    1536,
    975
  );

  const ctx = canvas.getContext("2d");

  // 🖼️ Fondo
  const fondo = await Canvas.loadImage(
    path.join(
      process.cwd(),
      "assets",
      "cedulapanama.png"
    )
  );

  ctx.drawImage(
    fondo,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // 👤 Avatar Roblox
  if (avatarUrl) {

    const avatarResponse =
      await axios.get(
        avatarUrl,
        {
          responseType: "arraybuffer"
        }
      );

    const avatar =
      await Canvas.loadImage(
        Buffer.from(
          avatarResponse.data
        )
      );

    ctx.drawImage(
  avatar,
  100,
  200,
  390,
  500
);
  }

// Configuración global de estilo
ctx.fillStyle = "#0a0a0a"; // Un negro ligeramente más suave y realista para impresión
ctx.textBaseline = "top";

// 1. NOMBRE USUAL (Línea superior del bloque de nombres)
ctx.font = '700 24px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  `${nombre} ${apellido}`,
  490, // Posición X al lado de "NOMBRE USUAL:"
  315  // Posición Y ajustada
);

// 2. NOMBRE LEGAL (Línea justo debajo del nombre usual)
ctx.font = '700 24px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  `${nombre} ${apellido}`, // O usa la variable correspondiente si difieren
  490, // Misma alineación X que el de arriba
  382  // Bajado para alinearse perfectamente con la etiqueta "NOMBRE LEGAL:"
);

// 3. FECHA DE NACIMIENTO
ctx.font = '700 22px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(nacimiento),
  560, // Movido más a la derecha para no chocar con "FECHA DE NACIMIENTO:"
  450  
);

// 4. LUGAR DE NACIMIENTO
ctx.font = '700 22px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(provincia),
  560, // Movido a la derecha para dejar espacio a "LUGAR DE NACIMIENTO:"
  518  
);

// 5. SEXO (¡Faltaba en tu código! Se alinea debajo de "SEXO:")
ctx.font = '700 22px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(sexo), // Asegúrate de pasar esta variable (ej: "M" o "F")
  430, // Posición horizontal debajo del texto "SEXO:"
  585  
);

// 6. TIPO DE SANGRE
ctx.font = '700 22px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(sangre),
  695, // Movido horizontalmente a la derecha para que caiga justo bajo "TIPO DE SANGRE:"
  585  // Misma altura que el Sexo
);

// 7. EXPEDIDA (Fecha de Emisión)
ctx.font = '700 22px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaEmision),
  430, // Ajustado a la izquierda para alinearse bajo el texto "EXPEDIDA:"
  652  
);

// 8. EXPIRA (Fecha de Expiración)
ctx.font = '700 22px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaExpiracion),
  410, // Ajustado a la izquierda para alinearse bajo el texto "EXPIRA:"
  735  
);

// 9. NÚMERO DE CÉDULA (Más grande, estilizado y limpio)
ctx.font = '800 38px "Noto Sans Condensed Black", sans-serif'; // Subido a grosor 800 y tamaño 38px para que resalte
ctx.fillStyle = "#000000"; // Negro puro para máxima legibilidad
ctx.fillText(
  String(cedula),
  175, // Centrado de forma óptima debajo de la foto, sin tocar el sello holográfico "TE"
  845  // Bajado sutilmente para darle un aspecto simétrico con el borde inferior
);

  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    {
      name: "cedula.png"
    }
  );
};
