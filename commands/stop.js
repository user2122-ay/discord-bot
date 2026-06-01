const { SlashCommandBuilder } = require("discord.js");

const queues = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Detiene la música"),

  async execute(interaction) {

    const queue = queues.get(interaction.guild.id);

    if (!queue || !queue.playing) {
      return interaction.reply({
        content: "❌ No hay música reproduciéndose.",
        ephemeral: true
      });
    }

    // 🔒 solo el que puso música puede parar la cola
    const firstSongUser = queue.songs[0]?.user;

    if (firstSongUser !== interaction.user.id) {
      return interaction.reply({
        content: "❌ Solo quien puso la música puede detenerla.",
        ephemeral: true
      });
    }

    queue.songs = [];
    queue.player.stop();
    queue.connection?.destroy();

    return interaction.reply("⛔ Música detenida.");
  }
};
