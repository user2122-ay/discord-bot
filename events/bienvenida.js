const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

    const CANAL_BIENVENIDA = "1451018651351384199";

    client.on("guildMemberAdd", async (member) => {

        const canal = await member.guild.channels.fetch(CANAL_BIENVENIDA).catch(() => null);
        if (!canal) return;

        // 👋 Mensaje fuera del embed
        await canal.send(`¡<@${member.id}> ingresó al servidor! 🎉`);

        // 📦 Embed bonito
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("👋 ¡Bienvenido/a a Panamá RP V2! 🌴")
            .setDescription(
`Nos alegra tenerte en esta ciudad donde cada decisión cuenta y cada historia deja huella. Panamá RP V2 es un servidor enfocado en el rol serio, realista y respetuoso, donde podrás desarrollar a tu personaje desde cero y vivir experiencias únicas dentro de un entorno activo y organizado.

📌 Antes de comenzar, te recomendamos:

• Leer atentamente las normativas del servidor.
• Elegir tu rol y facción con responsabilidad.
• Mantener siempre el respeto hacia la comunidad y el staff.

🔐 Verifícate aquí:
https://discord.com/channels/1345956472986796183/1459259725131809069

📜 Lee la normativa aquí:
https://discord.com/channels/1345956472986796183/1451018653259792536

🎭 Aprende los conceptos de rol aquí:
https://discord.com/channels/1345956472986796183/1451771796918636697

🎫 ¿Tienes dudas? Abre ticket aquí:
https://discord.com/channels/1345956472986796183/1451018705528946923`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: "© Panamá RP V2 | Todos los derechos reservados®",
                iconURL: member.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        await canal.send({ embeds: [embed] });
    });

};
