module.exports = (client) => {

const CANAL_BIENVENIDA = "1463192290905559155"; // ⚠️ cámbialo

client.on("guildMemberAdd", async (member) => {
    const canal = member.guild.channels.cache.get(CANAL_BIENVENIDA);
    if (!canal) return;

    // 👋 Mensaje fuera del embed
    const mensaje = `¡<@${member.id}> ingresó al servidor!`;

    // 🎨 Embed
    const embed = {
        color: 0x2ecc71,
        thumbnail: {
            url: member.user.displayAvatarURL({ dynamic: true })
        },
        description:
`👋 **¡Bienvenido/a a Los Santos Spanish RP!** 🌴

Nos alegra tenerte en esta ciudad donde cada decisión cuenta y cada historia deja huella. **Los Santos Spanish RP** es un servidor enfocado en el **rol serio, realista y respetuoso**, donde podrás desarrollar a tu personaje desde cero y vivir experiencias únicas dentro de un entorno activo y organizado.

📌 **Antes de comenzar**, te recomendamos:

• Leer atentamente las **normativas** del servidor.  
• Elegir tu **rol y facción** con responsabilidad.  
• Mantener siempre el **respeto** hacia la comunidad y el staff.`,
        footer: {
            text: "© Los Santos RP | Todos los derechos reservados®",
            icon_url: member.user.displayAvatarURL({ dynamic: true })
        },
        timestamp: new Date()
    };

    canal.send({
        content: mensaje,
        embeds: [embed]
    });
});

};
