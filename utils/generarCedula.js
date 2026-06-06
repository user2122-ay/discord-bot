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
ctx.fillStyle = "#0c0c0c"; // Un negro nítido pero realista para impresión
ctx.textBaseline = "top";

// 1. NOMBRE USUAL (Alineado a la derecha de la etiqueta "NOMBRE USUAL:")
ctx.font = '700 28px "Noto Sans Condensed Black", sans-serif'; // Aumentado a 28px
ctx.fillText(
  `${nombre} ${apellido}`,
  520, // Movido a la derecha para no pisar la etiqueta
  280  // Centrado verticalmente con la línea de la etiqueta
);

// 2. NOMBRE LEGAL (Alineado a la derecha de la etiqueta "NOMBRE LEGAL:")
ctx.font = '700 28px "Noto Sans Condensed Black", sans-serif'; // Aumentado a 28px
ctx.fillText(
  `${nombre} ${apellido}`, 
  520, // Alineado con el nombre usual
  350  
);

// 3. FECHA DE NACIMIENTO (Abajo de la etiqueta "FECHA DE NACIMIENTO:")
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif'; // Aumentado a 26px
ctx.fillText(
  String(nacimiento),
  345, // Alineado a la izquierda del bloque de texto
  450  // Bajado para que quede DEBAJO de la etiqueta "FECHA DE NACIMIENTO:"
);

// 4. LUGAR DE NACIMIENTO (Abajo de la etiqueta "LUGAR DE NACIMIENTO:")
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif'; // Aumentado a 26px
ctx.fillText(
  String(provincia),
  345, // Mismo margen izquierdo
  520  // Bajado para que quede DEBAJO de la etiqueta "LUGAR DE NACIMIENTO:"
);


// 6. TIPO DE SANGRE (Abajo de la etiqueta "TIPO DE SANGRE:")
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(sangre),
  480, // Desplazado a la derecha para que caiga justo bajo "TIPO DE SANGRE:"
  590  // Misma altura horizontal que el Sexo
);

// 7. EXPEDIDA (Alineado a la derecha de la etiqueta "EXPEDIDA:")
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaEmision),
  470, // Movido a la derecha de la palabra "EXPEDIDA:"
  625  
);

// 8. EXPIRA (Alineado a la derecha de la etiqueta "EXPIRA:")
ctx.font = '700 26px "Noto Sans Condensed Black", sans-serif';
ctx.fillText(
  String(fechaExpiracion),
  440, // Movido a la derecha de la palabra "EXPIRA:"
  675  
);

// 9. NÚMERO DE CÉDULA (Grande y destacado abajo a la izquierda)
ctx.font = '800 42px "Noto Sans Condensed Black", sans-serif'; // Subido a 42px
ctx.fillStyle = "#000000"; // Negro puro
ctx.fillText(
  String(cedula),
  115, // Ajustado a la izquierda para que empiece limpio bajo la foto
  850  // Bajado para respetar el holograma redondo de la esquina inferior
);

  return new AttachmentBuilder(
    canvas.toBuffer("image/png"),
    {
      name: "cedula.png"
    }
  );
};
