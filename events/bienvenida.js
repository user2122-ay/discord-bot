const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

    const CANAL_BIENVENIDA = "1463192290905559155";

    client.on("guildMemberAdd", async (member) => {

        console.log("📥 Nuevo usuario:", member.user.tag);

        const canal = await member.guild.channels.fetch(CANAL_BIENVENIDA).catch(() => null);
        if (!canal) {
            console.log("❌ Canal no encontrado");
            return;
        }

        try {

            await canal.send(`¡<@${member.id}> ingresó al servidor! 🎉`);

            const embed = new EmbedBuilder()
                .setTitle("👋 ¡Bienvenido/a a Los Santos Spanish RP! 🌴")
                .setDescription(
`Nos alegra tenerte en la ciudad.

📌 Lee las normas
📌 Respeta a todos
📌 Disfruta el rol`
                )
                .setColor(0x2ecc71)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Usuario: ${member.user.tag}`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await canal.send({ embeds: [embed] });

        } catch (err) {
            console.log("❌ Error enviando bienvenida:", err);
        }
    });

};
