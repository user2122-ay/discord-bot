const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔒 ROL AUTORIZADO
const ROL_AUTORIZADO = "1463192290456764549";

// 📜 CANAL LOGS
const CANAL_LOGS = "1465418290569547877";

module.exports = {
  permisos: `<@&${ROL_AUTORIZADO}>`,

  data: new SlashCommandBuilder()
    .setName("añadir-dinero")
    .setDescription("Añadir dinero a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("destino")
        .setDescription("Dónde añadir el dinero")
        .setRequired(true)
        .addChoices(
          { name: "💵 Efectivo", value: "efectivo" },
          { name: "🏦 Banco", value: "banco" }
        )
    ),

  async execute(interaction) {

    // 🔒 Verificar rol
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({
        content: "❌ No tienes permiso.",
        ephemeral: true
      });
    }

    const target = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");
    const destino = interaction.options.getString("destino");

    if (cantidad <= 0) {
      return interaction.reply({
        content: "❌ Cantidad inválida.",
        ephemeral: true
      });
    }

    // 🔥 GUARDAR EN POSTGRES
    try {

      // Crear usuario si no existe
      await interaction.pool.query(`
        INSERT INTO economia_usuarios (user_id, efectivo, banco)
        VALUES ($1, 0, 0)
        ON CONFLICT (user_id) DO NOTHING
      `, [target.id]);

      if (destino === "efectivo") {
        await interaction.pool.query(`
          UPDATE economia_usuarios
          SET efectivo = efectivo + $1
          WHERE user_id = $2
        `, [cantidad, target.id]);
      }

      if (destino === "banco") {
        await interaction.pool.query(`
          UPDATE economia_usuarios
          SET banco = banco + $1
          WHERE user_id = $2
        `, [cantidad, target.id]);
      }

    } catch (err) {
      console.error("❌ DB error:", err);
      return interaction.reply({
        content: "❌ Error con la base de datos.",
        ephemeral: true
      });
    }

    // ✅ RESPUESTA
    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle("💰 Dinero añadido")
      .addFields(
        { name: "👤 Usuario", value: `<@${target.id}>`, inline: true },
        { name: "💵 Cantidad", value: `$${cantidad}`, inline: true },
        { name: "🏦 Destino", value: destino === "banco" ? "Banco" : "Efectivo", inline: true }
      )
      .setFooter({
        text: `Acción realizada por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // 📜 LOG
    const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS);

    if (canalLogs) {
      const logEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("📜 Log de Economía")
        .addFields(
          { name: "👮 Responsable", value: `<@${interaction.user.id}>`, inline: true },
          { name: "👤 Usuario", value: `<@${target.id}>`, inline: true },
          { name: "💰 Cantidad", value: `$${cantidad}`, inline: true },
          { name: "🏦 Destino", value: destino === "banco" ? "Banco" : "Efectivo", inline: true }
        )
        .setTimestamp();

      canalLogs.send({ embeds: [logEmbed] });
    }

  }
};
