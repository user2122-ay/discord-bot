const Canvas = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const axios = require("axios");
const path = require("path");

Canvas.registerFont(
  path.join(process.cwd(), "assets", "fonts", "NotoSans_Condensed-Black.ttf"),
  { family: "NotoSans" }
);

module.exports = async ({
  nombre,
  apellido,
  nacimiento,
  sangre,
  sexo,
  provincia,
  cedula,
  avatarUrl,
  fechaEmision,
  fechaExpiracion
}) => {

  const canvas = Canvas.createCanvas(1536, 975);
  const ctx = canvas.getContext("2d");

  // 🖼️ Fondo
  const fondo = await Canvas.loadImage(
    path.join(process.cwd(), "assets", "cedulapanama.png")
  );
  ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

  // 👤 Avatar Roblox
  if (avatarUrl) {
    const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatar = await Canvas.loadImage(Buffer.from(avatarResponse.data));
    ctx.drawImage(avatar, 100, 200, 390, 500);
  }

  ctx.fillStyle = "#0c0c0c";
  ctx.textBaseline = "top";

  // 1. NOMBRE USUAL (etiqueta termina en x~714)
  ctx.font = '700 28px NotoSans';
  ctx.fillText(`${nombre} ${apellido}`, 725, 272);

  // 2. NOMBRE LEGAL (etiqueta termina en x~698)
  ctx.font = '700 28px NotoSans';
  ctx.fillText(`${nombre} ${apellido}`, 725, 338);

  // 3. FECHA DE NACIMIENTO (etiqueta termina en x~773)
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(nacimiento), 785, 412);

  // 4. LUGAR DE NACIMIENTO (etiqueta termina en x~772)
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(provincia), 785, 460);

  // 5. SEXO (etiqueta "SEXO:" termina en canvas x~656, y~483)
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(sexo), 665, 471);

  // 6. TIPO DE SANGRE (etiqueta termina en canvas x~778, dato va después)
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(sangre), 788, 471);

  // 7. EXPEDIDA (etiqueta termina en canvas x~584, y~539)
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(fechaEmision), 595, 526);

  // 8. EXPIRA (etiqueta termina en canvas x~641, y~603)
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(fechaExpiracion), 652, 590);

  // 9. NÚMERO DE CÉDULA (más a la derecha del logo TE)
  ctx.font = '800 42px NotoSans';
  ctx.fillStyle = "#000000";
  ctx.fillText(String(cedula), 290, 790);

  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    { name: "cedula.png" }
  );
};
