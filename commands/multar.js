const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const ROLES_AUTORIZADOS = [
  "1463192290381271046",
  "1463192290381271043", 
  "1463192290381271044", 
  "1463192290389528671", 
  "1463192290389528668", 
  "1463192290389528670", 
  "1463192290389528669", 
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("multar")
    .setDescription("Registrar una multa vehicular")

    // 🔥 REQUIRED PRIMERO (IMPORTANTE)
    .addStringOption(o =>
      o.setName("placa").setDescription("Placa del vehículo").setRequired(true)
    )
    .addUserOption(o =>
      o.setName("usuario").setDescription("Usuario multado").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("oficial").setDescription("Oficial que impone la multa").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("lugar").setDescription("Lugar de la infracción").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo").setDescription("Motivo de la multa").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("monto").setDescription("Monto de la multa").setRequired(true)
    )
    .addAttachmentOption(o =>
      o.setName("imagen").setDescription("Imagen de evidencia").setRequired(true)
    )

    // ✅ OPCIONAL AL FINAL
    .addUserOption(o =>
      o.setName("companero")
        .setDescription("Compañero en el operativo")
        .setRequired(false)
    ),

  permisos: "👮 Fuerza Pública",

  async execute(interaction) {

    // 🔒 Verificar roles
    if (!interaction.member.roles.cache.some(r => ROLES_AUTORIZADOS.includes(r.id))) {
      return interaction.reply({
        content: "⛔ No tienes permisos para usar este comando.",
        ephemeral: true
      });
    }

    // 📦 Obtener datos
    const placa = interaction.options.getString("placa");
    const usuario = interaction.options.getUser("usuario");
    const oficial = interaction.options.getString("oficial");
    const lugar = interaction.options.getString("lugar");
    const motivo = interaction.options.getString("motivo");
    const monto = interaction.options.getInteger("monto");
    const imagen = interaction.options.getAttachment("imagen");
    const companeroUser = interaction.options.getUser("companero");

    // 🧠 Leer JSON sin crashear
    let data = {};
    try {
      if (fs.existsSync("./multasData.json")) {
        data = JSON.parse(fs.readFileSync("./multasData.json", "utf8"));
      }
    } catch (err) {
      console.error("Error leyendo JSON:", err);
      data = {};
    }

    const multa = {
      placa,
      usuario: usuario.id,
      oficial,
      companero: companeroUser ? companeroUser.id : null,
      lugar,
      motivo,
      monto,
      imagen: imagen.url,
      fecha: new Date().toLocaleString()
    };

    // 💾 Guardar en JSON
    if (!data[usuario.id]) data[usuario.id] = [];
    data[usuario.id].push(multa);

    fs.writeFileSync("./multasData.json", JSON.stringify(data, null, 2));

    console.log("✅ Multa guardada:", multa);

    // 🗄️ GUARDAR EN POSTGRES (opcional)
    try {
      await interaction.pool.query(
        `INSERT INTO "MULTAS_LS"
        (user_id, placa, oficial, lugar, motivo, monto, imagen, fecha)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          multa.usuario,
          multa.placa,
          multa.oficial,
          multa.lugar,
          multa.motivo,
          multa.monto,
          multa.imagen,
          multa.fecha
        ]
      );
    } catch (err) {
      console.error("❌ Error guardando en DB:", err);
      return interaction.reply({
        content: "❌ Error guardando la multa en la base de datos",
        ephemeral: true
      });
    }

    // 📢 EMBED
    const embed = new EmbedBuilder()
      .setTitle("🚨 Multa Registrada")
      .setColor(0xe67e22)
      .setImage(multa.imagen)
      .addFields(
        { name: "🚗 Placa", value: multa.placa, inline: true },
        { name: "👤 Usuario", value: `<@${multa.usuario}>`, inline: true },
        { name: "👮 Oficial", value: multa.oficial, inline: true },
        { 
          name: "👮‍♂️ Compañero", 
          value: multa.companero ? `<@${multa.companero}>` : "No asignado", 
          inline: true 
        },
        { name: "📍 Lugar", value: multa.lugar, inline: true },
        { name: "📝 Motivo", value: multa.motivo, inline: false },
        { name: "💰 Monto", value: `$${multa.monto}`, inline: true }
      )
      .setFooter({
        text: `Gobierno de Los Santos RP | ${multa.fecha}`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
