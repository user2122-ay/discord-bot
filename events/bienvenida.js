const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

    const CANAL_BIENVENIDA = "1463192291811528930";

    client.on("guildMemberAdd", async (member) => {

        const canal = member.guild.channels.cache.get(CANAL_BIENVENIDA);
        if (!canal) return;

        try {

            // 👋 Mensaje fuera del embed
            await canal.send(`¡<@${member.id}> ingresó al servidor! 🎉`);

            // 📦 Embed
            const embed = new EmbedBuilder()
                .setTitle("👋 ¡Bienvenido/a a Los Santos Spanish RP! 🌴")
                .setDescription(
`Nos alegra tenerte en esta ciudad donde cada decisión cuenta y cada historia deja huella.

**Los Santos Spanish RP** es un servidor enfocado en el **rol serio, realista y respetuoso**, donde podrás desarrollar a tu personaje desde cero y vivir experiencias únicas.

📌 **Antes de comenzar:**
• Lee las normativas
• Elige tu rol correctamente
• Respeta a la comunidad y staff`
                )
                .setColor(0x2ecc71)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: "© Los Santos RP | Todos los derechos reservados®",
                    iconURL: member.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await canal.send({ embeds: [embed] });

        } catch (error) {
            console.log("❌ Error en bienvenida:", error);
        }
    });

};
