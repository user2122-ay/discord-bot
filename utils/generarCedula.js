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

  // 4. LUGAR DE NACIMIENTO — canvas_y=475, dato después de x=773
ctx.font = '700 26px NotoSans';
ctx.fillText(String(provincia), 785, 462);

// 5. SEXO — canvas_y=544, SEXO: termina en x=586
ctx.font = '700 26px NotoSans';
ctx.fillText(String(sexo), 596, 531);

// 6. TIPO DE SANGRE — canvas_y=544, etiqueta termina en x=906
ctx.font = '700 26px NotoSans';
ctx.fillText(String(sangre), 916, 531);

// 7. EXPEDIDA — canvas_y=607, etiqueta termina en x=634
ctx.font = '700 26px NotoSans';
ctx.fillText(String(fechaEmision), 644, 594);

// 8. EXPIRA — canvas_y=664, etiqueta termina en x=605
ctx.font = '700 26px NotoSans';
ctx.fillText(String(fechaExpiracion), 615, 651);

// 9. NÚMERO DE CÉDULA — más grande
ctx.font = '800 52px NotoSans';
ctx.fillStyle = "#000000";
ctx.fillText(String(cedula), 290, 790);
  
  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    { name: "cedula.png" }
  );
};
