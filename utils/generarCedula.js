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

// 1. NOMBRE USUAL — empieza justo después de la etiqueta (termina en x:724)
ctx.font = '700 28px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  `${nombre} ${apellido}`,
  735,   // +11px después del fin de "NOMBRE USUAL:"
  278    // centrado en y:292
);

// 2. NOMBRE LEGAL — etiqueta termina en x:720
ctx.font = '700 28px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  `${nombre} ${apellido}`,
  735,   // mismo X que nombre usual
  341    // centrado en y:355
);

// 3. FECHA DE NACIMIENTO — etiqueta termina en x:804
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(nacimiento),
  815,   // +11px después del fin de "FECHA DE NACIMIENTO:"
  416    // centrado en y:430
);

// 4. LUGAR DE NACIMIENTO — etiqueta termina en x:803
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(provincia),
  815,   // mismo X que fecha
  469    // centrado en y:483
);

// 6. TIPO DE SANGRE — misma fila que SEXO
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(sangre),
  870,
  534
);

// 7. EXPEDIDA — etiqueta termina ~x:620
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaEmision),
  635,
  539
);

// 8. EXPIRA — etiqueta termina en x:662
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaExpiracion),
  675,
  601
);

// 9. NÚMERO DE CÉDULA — alineado con logo TE (a su derecha, misma altura)
ctx.font = '800 42px "Noto Sans Condensed Black", sans-serif';
ctx.fillStyle = "#000000";
ctx.fillText(
  String(cedula),
  200,   // a la derecha del logo TE
  820    // altura del logo TE
);
  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    {
      name: "cedula.png"
    }
  );
};
