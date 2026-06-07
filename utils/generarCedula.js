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

  // 1. NOMBRE USUAL — etiqueta termina en x~714, dato va a la derecha
  ctx.font = '700 28px NotoSans';
  ctx.fillText(`${nombre} ${apellido}`, 725, 272);

  // 2. NOMBRE LEGAL — etiqueta termina en x~698
  ctx.font = '700 28px NotoSans';
  ctx.fillText(`${nombre} ${apellido}`, 725, 338);

  // 3. FECHA DE NACIMIENTO — etiqueta termina en x~773
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(nacimiento), 785, 412);

  // 4. LUGAR DE NACIMIENTO — etiqueta termina en x~772
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(provincia), 785, 463);

  // 5. SEXO — etiqueta "SEXO:" termina en x~602, dato va justo después
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(sexo), 612, 470);

  // 6. TIPO DE SANGRE — etiqueta empieza en x~660, dato va después de "TIPO DE SANGRE:"
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(sangre), 870, 470);

  // 7. EXPEDIDA — etiqueta termina en x~585, dato va a la derecha en la MISMA fila
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(fechaEmision), 600, 526);

  // 8. EXPIRA — etiqueta termina en x~642
  ctx.font = '700 26px NotoSans';
  ctx.fillText(String(fechaExpiracion), 655, 590);

  // 9. NÚMERO DE CÉDULA — alineado con logo TE
  ctx.font = '800 42px NotoSans';
  ctx.fillStyle = "#000000";
  ctx.fillText(String(cedula), 230, 790);

  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    { name: "cedula.png" }
  );
};
