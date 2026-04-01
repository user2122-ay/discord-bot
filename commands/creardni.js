const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// 🧾 ROL QUE SE DA AL CREAR DNI
const ROL_DNI = "1463192290360295645";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("creardni")
    .setDescription("Crear DNI IC")
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
    ),

  async execute(interaction) {
    const filePath = path.join(__dirname, "..", "dniData.json");

    let data = {};
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      data = {};
    }

    const dni = Math.floor(10000000 + Math.random() * 90000000);

    const nombre = interaction.options.getString("nombre");
    const apellido = interaction.options.getString("apellido");
    const edad = interaction.options.getInteger("edad");
    const nacimiento = interaction.options.getString("nacimiento");
    const sangre = interaction.options.getString("sangre");

    // 🔥 VERIFICAR EN BASE DE DATOS SI YA TIENE DNI
    try {
      const check = await interaction.pool.query(
        `SELECT * FROM "DNI_LS" WHERE user_id = $1`,
        [interaction.user.id]
      );

      if (check.rows.length > 0) {
        return interaction.reply({
          content: "❌ Ya tienes un DNI registrado, no puedes crear otro.",
          ephemeral: true
        });
      }
    } catch (err) {
      console.error("❌ Error verificando DNI:", err);
      return interaction.reply({
        content: "❌ Error verificando en la base de datos",
        ephemeral: true
      });
    }

    // 🔹 Guardar en JSON (opcional, puedes borrarlo después)
    data[interaction.user.id] = {
      nombre,
      apellido,
      edad,
      nacimiento,
      sangre,
      dni
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // 🔥 GUARDAR EN POSTGRES
    try {
      await interaction.pool.query(
        `INSERT INTO "DNI_LS"
        (user_id, nombre, apellido, edad, fecha_nacimiento, sangre, dni_numero)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          interaction.user.id,
          nombre,
          apellido,
          edad,
          nacimiento,
          sangre,
          dni.toString()
        ]
      );
    } catch (err) {
      console.error("❌ Error guardando en DB:", err);
      return interaction.reply({
        content: "❌ Error guardando el DNI",
        ephemeral: true
      });
    }

    // ✅ AÑADIR ROL
    if (!interaction.member.roles.cache.has(ROL_DNI)) {
      await interaction.member.roles.add(ROL_DNI).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setTitle("🪪 Documento Nacional de Identidad")
      .setColor(0x3498db)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Nombre IC", value: nombre, inline: true },
        { name: "👤 Apellido IC", value: apellido, inline: true },
        { name: "🎂 Edad IC", value: `${edad}`, inline: true },
        { name: "📅 Nacimiento", value: nacimiento, inline: true },
        { name: "🩸 Sangre", value: sangre, inline: true },
        { name: "🆔 DNI", value: `${dni}`, inline: true }
      )
      .setFooter({
        text: `MIAMI HISPANO RP | ${new Date().toLocaleDateString()}`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
