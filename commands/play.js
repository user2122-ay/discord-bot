const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require("@discordjs/voice");

const play = require("play-dl");

// Cola global
const queues = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Reproduce música desde YouTube")
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

        let song;

        try {

            // Si es URL
            if (
                query.includes("youtube.com") ||
                query.includes("youtu.be")
            ) {

                const info = await play.video_basic_info(query);

                song = {
                    title: info.video_details.title,
                    url: query
                };

            } else {

                // Buscar por nombre
                const results = await play.search(query, {
                    limit: 1
                });

                if (!results.length) {
                    return interaction.editReply(
                        "❌ No encontré resultados."
                    );
                }

                song = {
                    title: results[0].title,
                    url: results[0].url
                };
            }

        } catch (err) {
            console.error(err);

            return interaction.editReply(
                "❌ Error obteniendo información de la canción."
            );
        }

        // Crear cola
        if (!queues.has(interaction.guild.id)) {

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
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
                    .setColor("#57F287")
                    .setTitle("🎵 Añadido a la cola")
                    .setDescription(`**${song.title}**`)
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
                        adapterCreator:
                            interaction.guild.voiceAdapterCreator,
                        selfDeaf: true
                    });

                    queue.connection.subscribe(queue.player);

                    console.log("✅ Conectado al canal");
                }

                console.log("🎵 Reproduciendo:", current.title);

                const stream = await play.stream(current.url);

                const resource = createAudioResource(
                    stream.stream,
                    {
                        inputType: stream.type,
                        inlineVolume: true
                    }
                );

                resource.volume?.setVolume(1);

                queue.player.play(resource);

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

                console.error(
                    "❌ Error reproduciendo:",
                    error
                );

                queue.songs.shift();

                playSong();
            }
        };

        await playSong();
    }
};
