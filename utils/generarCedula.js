const Canvas = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const axios = require("axios");
const path = require("path");

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

  // Fondo

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

  // Avatar Roblox

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
      85,
      205,
      410,
      500
    );
  }

  // Texto

  ctx.fillStyle = "#111111";

  ctx.font =
    "bold 34px Arial";

  ctx.fillText(
    `${nombre} ${apellido}`,
    550,
    290
  );

  ctx.fillText(
    nacimiento,
    550,
    390
  );

  ctx.fillText(
    provincia,
    550,
    490
  );

  ctx.fillText(
    sangre,
    820,
    590
  );

  ctx.fillText(
    fechaEmision,
    550,
    700
  );

  ctx.fillText(
    fechaExpiracion,
    550,
    790
  );

  ctx.font =
    "bold 52px Arial";

  ctx.fillText(
    cedula,
    300,
    870
  );

  const attachment =
    new AttachmentBuilder(
      canvas.toBuffer("image/png"),
      {
        name: "cedula.png"
      }
    );

  return attachment;
};
