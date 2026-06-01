const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const play = require("play-dl");

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

    // ❌ usuario no está en VC
    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ Debes estar en un canal de voz.",
        ephemeral: true
      });
    }

    await interaction.reply("🔎 Buscando canción...");

    const search = await play.search(query, { limit: 1 });
    if (!search.length) {
      return interaction.editReply("❌ No se encontró la canción.");
    }

    const song = search[0];

    // 🔥 crear o obtener cola
    if (!queues.has(interaction.guild.id)) {
      queues.set(interaction.guild.id, {
        songs: [],
        player: createAudioPlayer(),
        connection: null,
        playing: false
      });
    }

    const queue = queues.get(interaction.guild.id);

    queue.songs.push({
      title: song.title,
      url: song.url,
      user: interaction.user.id
    });

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🎵 Añadido a la cola")
      .setDescription(`**${song.title}**`)
      .setFooter({ text: `Pedido por ${interaction.user.username}` });

    await interaction.editReply({ embeds: [embed] });

    // 🔥 evitar doble reproducción
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

      // 🔊 crear stream
      const stream = await play.stream(current.url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      // 🔥 conectar si no está conectado
      if (!queue.connection) {

        const botVoice = interaction.guild.members.me.voice.channel;

        if (botVoice && botVoice.id !== voiceChannel.id) {
          queue.connection?.destroy();
          queue.connection = null;
        }

        queue.connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator
        });

        queue.connection.subscribe(queue.player);
      }

      queue.player.play(resource);

      queue.player.once(AudioPlayerStatus.Idle, () => {
        queue.songs.shift();
        playSong();
      });
    };

    playSong();
  }
};
