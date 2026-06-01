const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");

// 🔥 IMPORTANTE: fuera del comando
const queues = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce música")
    .addStringOption(option =>
      option
        .setName("musica")
        .setDescription("Nombre o URL")
        .setRequired(true)
    ),

  async execute(interaction) {

    const query = interaction.options.getString("musica");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ Debes estar en un canal de voz.",
        ephemeral: true
      });
    }

    await interaction.reply("🔎 Buscando canción...");

    if (!query.includes("youtube.com") && !query.includes("youtu.be")) {
  return interaction.editReply(
    "❌ Por ahora solo se aceptan enlaces de YouTube."
  );
}
    const song = {
  title: query,
  url: query
};

    // 🔥 crear cola por server
    if (!queues.has(interaction.guild.id)) {
      queues.set(interaction.guild.id, {
        songs: [],
        player: createAudioPlayer(),
        connection: null,
        playing: false,
        channelId: voiceChannel.id
      });
    }

    const queue = queues.get(interaction.guild.id);

    queue.songs.push(song);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🎵 Añadido a la cola")
          .setDescription(song.title)
      ]
    });

    if (queue.playing) return;

    const playSong = async () => {

      const current = queue.songs[0];

      if (!current) {
        queue.playing = false;
        queue.connection?.destroy();
        queue.connection = null;
        return;
      }

      queue.playing = true;

      // 🔥 conexión segura
      if (!queue.connection) {
        queue.connection = joinVoiceChannel({
          channelId: queue.channelId,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: true
        });

        queue.connection.subscribe(queue.player);
        console.log("✅ Conectado al canal de voz");
      }

      console.log("🎵 Reproduciendo:", current);
console.log("🔗 URL:", current.url); 

      const stream = ytdl(current.url, {
  filter: "audioonly",
  highWaterMark: 1 << 25,
  quality: "highestaudio"
});

      const resource = createAudioResource(stream);

      queue.player.play(resource);
      console.log("▶️ Audio enviado al reproductor");

      queue.player.removeAllListeners(
        AudioPlayerStatus.Idle
      );

      queue.player.once(
        AudioPlayerStatus.Idle,
        () => {
          queue.songs.shift();
          playSong();
        }
      );
    };

    await playSong();
  }
};
