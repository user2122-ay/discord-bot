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
ctx.fillStyle = "#0c0c0c";
ctx.textBaseline = "top";

// 1. NOMBRE USUAL — la etiqueta termina ~aprox x:700, y:268
ctx.font = '700 28px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  `${nombre} ${apellido}`,
  700,   // justo después de "NOMBRE USUAL:"
  268
);

// 2. NOMBRE LEGAL — etiqueta en y~340
ctx.font = '700 28px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  `${nombre} ${apellido}`,
  700,   // alineado con nombre usual
  340
);

// 3. FECHA DE NACIMIENTO — etiqueta en y~420
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(nacimiento),
  760,   // después de "FECHA DE NACIMIENTO:"
  420
);

// 4. LUGAR DE NACIMIENTO — etiqueta en y~468
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(provincia),
  760,   // después de "LUGAR DE NACIMIENTO:"
  468
);

// 5. SEXO — etiqueta en y~530, x corto
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(sexo),
  590,   // después de "SEXO:"
  530
);

// 6. TIPO DE SANGRE — misma fila que SEXO, más a la derecha
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(sangre),
  870,   // después de "TIPO DE SANGRE:"
  530
);

// 7. EXPEDIDA — etiqueta en y~590
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaEmision),
  630,   // después de "EXPEDIDA:"
  590
);

// 8. EXPIRA — etiqueta en y~645
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaExpiracion),
  610,   // después de "EXPIRA:"
  645
);

// 9. NÚMERO DE CÉDULA — parte inferior izquierda
ctx.font = '800 42px "Noto Sans Condensed Black", sans-serif';
ctx.fillStyle = "#000000";
ctx.fillText(
  String(cedula),
  60,    // margen izquierdo bajo la foto
  880
);
  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    {
      name: "cedula.png"
    }
  );
};
