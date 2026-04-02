const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Comando de prueba"),

  permisos: "🌍 Todos",

  async execute(interaction) {
    await interaction.reply("🏓 Pong! El bot está vivo.");
  }
};
