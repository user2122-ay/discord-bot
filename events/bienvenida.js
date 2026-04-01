const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

    const CANAL_BIENVENIDA = "1463192290905559155";

    client.on("guildMemberAdd", async (member) => {

        const canal = await member.guild.channels.fetch(CANAL_BIENVENIDA).catch(() => null);
        if (!canal) return;

        // 👋 Mensaje fuera del embed
        await canal.send(`¡<@${member.id}> ingresó al servidor! 🎉`);

        // 📦 Embed bonito
        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("👋 ¡Bienvenido/a a Los Santos Spanish RP! 🌴")
            .setDescription(
`Nos alegra tenerte en esta ciudad donde cada decisión cuenta y cada historia deja huella. **Los Santos Spanish RP** es un servidor enfocado en el **rol serio, realista y respetuoso**, donde podrás desarrollar a tu personaje desde cero y vivir experiencias únicas dentro de un entorno activo y organizado.

📌 **Antes de comenzar**, te recomendamos:

• Leer atentamente las **normativas** del servidor.
• Elegir tu **rol y facción** con responsabilidad.
• Mantener siempre el **respeto** hacia la comunidad y el staff.`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: "© Los Santos RP | Todos los derechos reservados®",
                iconURL: member.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        await canal.send({ embeds: [embed] });
    });

};
