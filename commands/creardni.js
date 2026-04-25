const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🧾 ROL QUE SE DA AL CREAR DNI
const ROL_DNI = "1451018398874996966";

module.exports = {
  permisos: "🌐 Todos",

  data: new SlashCommandBuilder()
    .setName("crearcedula")
    .setDescription("Crear cédula Panamá RP V2")

    .addStringOption(o => o.setName("nombre").setDescription("Nombre IC").setRequired(true))
    .addStringOption(o => o.setName("apellido").setDescription("Apellido IC").setRequired(true))
    .addIntegerOption(o => o.setName("edad").setDescription("Edad IC").setRequired(true))
    .addStringOption(o => o.setName("nacimiento").setDescription("Fecha de nacimiento").setRequired(true))

    .addStringOption(o =>
      o.setName("sangre")
        .setDescription("Tipo de sangre")
        .setRequired(true)
        .addChoices(
          { name: "O+", value: "O+" },
          { name: "O-", value: "O-" },
          { name: "A+", value: "A+" },
          { name: "A-", value: "A-" },
          { name: "B+", value: "B+" },
          { name: "B-", value: "B-" },
          { name: "AB+", value: "AB+" },
          { name: "AB-", value: "AB-" }
        )
    )

    .addStringOption(o =>
      o.setName("provincia")
        .setDescription("Provincia")
        .setRequired(true)
        .addChoices(
          { name: "Bocas del Toro", value: "1" },
          { name: "Coclé", value: "2" },
          { name: "Colón", value: "3" },
          { name: "Chiriquí", value: "4" },
          { name: "Darién", value: "5" },
          { name: "Herrera", value: "6" },
          { name: "Los Santos", value: "7" },
          { name: "Panamá", value: "8" },
          { name: "Veraguas", value: "9" },
          { name: "Panamá Oeste", value: "13" }
        )
    ),

  async execute(interaction) {

    const nombre = interaction.options.getString("nombre");
    const apellido = interaction.options.getString("apellido");
    const edad = interaction.options.getInteger("edad");
    const nacimiento = interaction.options.getString("nacimiento");
    const sangre = interaction.options.getString("sangre");
    const provincia = interaction.options.getString("provincia");

    // 🔍 Verificar si ya tiene cédula
    try {
      const check = await interaction.pool.query(
        `SELECT * FROM "CIUDADANOS_PTY" WHERE discord_id = $1`,
        [interaction.user.id]
      );

      if (check.rows.length > 0) {
        return interaction.reply({
          content: "❌ Ya tienes una cédula registrada.",
          ephemeral: true
        });
      }
    } catch (err) {
      console.error("Error verificando:", err);
      return interaction.reply({
        content: "❌ Error verificando datos",
        ephemeral: true
      });
    }

    // 🔢 Generar cédula
    const tomo = Math.floor(100 + Math.random() * 900);
    const asiento = Math.floor(1000 + Math.random() * 9000);
    const cedula = `${provincia}-${tomo}-${asiento}`;

    // 💾 Guardar en base de datos
    try {
      await interaction.pool.query(
        `INSERT INTO "CIUDADANOS_PTY"
        (discord_id, nombre_ic, apellido_ic, edad_ic, nacimiento_ic, tipo_sangre, provincia_codigo, numero_cedula)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          interaction.user.id,
          nombre,
          apellido,
          edad,
          nacimiento,
          sangre,
          provincia,
          cedula
        ]
      );
    } catch (err) {
      console.error("Error guardando:", err);
      return interaction.reply({
        content: "❌ Error guardando la cédula",
        ephemeral: true
      });
    }

    // 🎭 Dar rol
    if (!interaction.member.roles.cache.has(ROL_DNI)) {
      await interaction.member.roles.add(ROL_DNI).catch(() => {});
    }

    // 📄 Embed
    const embed = new EmbedBuilder()
      .setTitle("🪪 Cédula de Identidad - Panamá RP V2")
      .setColor("#2b2d31")
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setDescription(
`# 📄 Documento Oficial

> Registro ciudadano completado correctamente`
      )
      .addFields(
        { name: "👤 Nombre", value: nombre, inline: true },
        { name: "👤 Apellido", value: apellido, inline: true },
        { name: "🎂 Edad", value: `${edad}`, inline: true },
        { name: "📅 Nacimiento", value: nacimiento, inline: true },
        { name: "🩸 Sangre", value: sangre, inline: true },
        { name: "🌎 Provincia", value: provincia, inline: true },
        { name: "🆔 Cédula", value: cedula, inline: true }
      )
      .setFooter({
        text: "Gobierno de Panamá RP V2",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
