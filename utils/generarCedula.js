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
ctx.fillStyle = "#000000";
ctx.textBaseline = "top"; // Cambiado a "top" para controlar mejor la alineación vertical con las líneas impresas

// 1. Nombre y Apellido (Debe alinearse al lado de NOMBRE USUAL)
ctx.font = '700 24px "Noto Sans Condensed Black"'; // Reducido un poco para que no choque con el diseño
ctx.fillText(
  `${nombre} ${apellido}`,
  490, // Coordenada X ajustada a la derecha de las etiquetas fijas
  315  // Coordenada Y alineada visualmente
);

// 2. Fecha de nacimiento
ctx.font = '700 22px "Noto Sans Condensed Black"';
ctx.fillText(
  String(nacimiento),
  490, // Misma alineación X que el nombre
  450  
);

// 3. Lugar de nacimiento / Provincia
ctx.font = '700 22px "Noto Sans Condensed Black"';
ctx.fillText(
  String(provincia),
  490, 
  518  
);

// 4. Tipo de Sangre (Va más a la derecha, debajo de TIPO DE SANGRE:)
ctx.font = '700 22px "Noto Sans Condensed Black"';
ctx.fillText(
  String(sangre),
  630, // Movido a la izquierda respecto a tu código para que cuadre bajo su etiqueta
  585  
);

// 5. Fecha de Emisión (Expedida)
ctx.font = '700 22px "Noto Sans Condensed Black"';
ctx.fillText(
  String(fechaEmision),
  490, 
  650  
);

// 6. Fecha de Expiración (Expira)
ctx.font = '700 22px "Noto Sans Condensed Black"';
ctx.fillText(
  String(fechaExpiracion),
  490, 
  735  
);

// 7. Número de Cédula (Ubicado abajo a la izquierda, más grande)
ctx.font = '700 34px "Noto Sans Condensed Black"'; // Aumentado el tamaño según tu petición
ctx.fillText(
  String(cedula),
  195, // Centrado de mejor manera en la parte inferior izquierda
  825  
);
  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    {
      name: "cedula.png"
    }
  );
};
