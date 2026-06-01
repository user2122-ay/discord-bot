const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");

const queues = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Reproduce música desde YouTube")
        .addStringOption(option =>
            option
                .setName("musica")
                .setDescription("URL de YouTube")
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

        if (
            !query.includes("youtube.com") &&
            !query.includes("youtu.be")
        ) {
            return interaction.editReply(
                "❌ Solo se permiten enlaces de YouTube."
            );
        }

        const song = {
            title: query,
            url: query
        };

        if (!queues.has(interaction.guild.id)) {

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            });

            player.on("error", error => {
                console.error("❌ Error del reproductor:");
                console.error(error);
            });

            queues.set(interaction.guild.id, {
                songs: [],
                player,
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
                    .setDescription(song.url)
            ]
        });

        if (queue.playing) return;

        const playSong = async () => {

            const current = queue.songs[0];

            if (!current) {

                queue.playing = false;

                if (queue.connection) {
                    queue.connection.destroy();
                    queue.connection = null;
                }

                return;
            }

            queue.playing = true;

            try {

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

                console.log("🎵 Reproduciendo:", current.url);

                const stream = ytdl(current.url, {
                    filter: "audioonly",
                    quality: "highestaudio",
                    highWaterMark: 1 << 25
                });

                stream.on("error", error => {
                    console.error("❌ Error del stream:");
                    console.error(error);
                });

                const resource = createAudioResource(stream, {
                    inlineVolume: true
                });

                if (resource.volume) {
                    resource.volume.setVolume(1);
                }

                queue.player.play(resource);

                console.log("▶️ Audio enviado al reproductor");

                queue.player.removeAllListeners(
                    AudioPlayerStatus.Idle
                );

                queue.player.once(
                    AudioPlayerStatus.Idle,
                    () => {
                        console.log("⏭️ Canción terminada");
                        queue.songs.shift();
                        playSong();
                    }
                );

            } catch (error) {

                console.error("❌ Error general:");
                console.error(error);

                queue.songs.shift();
                playSong();
            }
        };

        await playSong();
    }
};
