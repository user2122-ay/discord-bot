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

// 1. NOMBRE USUAL
ctx.font = '700 28px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  `${nombre} ${apellido}`,
  735,
  278
);

// 2. NOMBRE LEGAL
ctx.font = '700 28px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  `${nombre} ${apellido}`,
  735,
  341
);

// 3. FECHA DE NACIMIENTO
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(nacimiento),
  815,
  416
);

// 4. LUGAR DE NACIMIENTO
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(provincia),
  815,
  469
);

// 5. TIPO DE SANGRE
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(sangre),
  870,
  520
);

// 6. EXPEDIDA
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaEmision),
  635,
  570
);

// 7. EXPIRA
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaExpiracion),
  610,
  620
);

// 8. NÚMERO DE CÉDULA
ctx.font = '800 42px "Noto Sans Condensed Black", sans-serif';
ctx.fillStyle = "#000000";
ctx.fillText(
  String(cedula),
  230,
  790
); 
  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    {
      name: "cedula.png"
    }
  );
};
