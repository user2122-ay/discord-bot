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
ctx.textBaseline = "middle";

ctx.font = "bold 42px Arial";

// Nombre
ctx.fillText(
  "PRUEBA",
  610,
  290
);
// Nacimiento
ctx.fillText(
  String(nacimiento),
  610,
  455
);

// Provincia
ctx.fillText(
  String(provincia),
  610,
  535
);

// Sangre
ctx.fillText(
  String(sangre),
  880,
  615
);

// Emisión
ctx.fillText(
  String(fechaEmision),
  610,
  690
);

// Expiración
ctx.fillText(
  String(fechaExpiracion),
  610,
  785
);

// Cédula
ctx.font = "bold 54px Arial";

ctx.fillText(
  String(cedula),
  280,
  885
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
