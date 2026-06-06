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
      95,
      220,
      320,
      420
    );
  }

  // ✍️ Texto
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "middle";

  ctx.font = "42px NotoSans";

  // Nombre
  ctx.fillText(
    `${nombre} ${apellido}`,
    760,
    290
  );

  // Nacimiento
  ctx.fillText(
    String(nacimiento),
    760,
    450
  );

  // Provincia
  ctx.fillText(
    String(provincia),
    760,
    535
  );

  // Sangre
  ctx.fillText(
    String(sangre),
    980,
    620
  );

  // Emisión
  ctx.fillText(
    String(fechaEmision),
    760,
    710
  );

  // Expiración
  ctx.fillText(
    String(fechaExpiracion),
    760,
    800
  );

  // Número de cédula
  ctx.font = "54px NotoSans";

  ctx.fillText(
    String(cedula),
    300,
    885
  );

  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    {
      name: "cedula.png"
    }
  );
};
