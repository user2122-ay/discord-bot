const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "verify",

    async execute(message) {

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("✅ Verificación Roblox")
            .setDescription(
`# Panamá RP V2

Para verificar tu cuenta sigue los pasos:

**1.** Pulsa el botón de verificación.
**2.** Escribe tu usuario de Roblox.
**3.** Recibe tu código único.
**4.** Coloca el código en tu descripción de Roblox.
**5.** Pulsa comprobar.
**6.** Espera la aprobación del staff.

> Una vez aprobada tu solicitud recibirás acceso al servidor.`
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("roblox_verificar")
                    .setLabel("Verificar Cuenta")
                    .setEmoji("✅")
                    .setStyle(ButtonStyle.Success)
            );

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
};
