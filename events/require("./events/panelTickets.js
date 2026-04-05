module.exports = (client) => {

    const {
        EmbedBuilder,
        ActionRowBuilder,
        StringSelectMenuBuilder
    } = require("discord.js");

    // 📌 CONFIG
    const CANAL_PANEL = "1463192291211477008";

    client.once("ready", async () => {

        try {
            const canal = await client.channels.fetch(CANAL_PANEL);

            if (!canal) return console.log("❌ Canal de tickets no encontrado");

            // 📌 EMBED
            const embed = new EmbedBuilder()
                .setColor("#2c2f33")
                .setTitle("🎫┃SISTEMA DE TICKETS")
                .setDescription(`Bienvenido/a al **Sistema Oficial de Atención y Soporte** de **Los Santos Spanish RP**.

Seleccione cuidadosamente la categoría que mejor se ajuste a su situación.

━━━━━━━━━━━━━━━━━━

<:moderador:1463940895698325708> **SOPORTE GENERAL**
<:admind:1463940988530589902> **REPORTAR USUARIO**
<:emoji_5:1463941230294597773> **REPORTAR STAFF**
<a:Alianza:1463941043870371891> **ALIANZA**
<:owner:1463941136229077033> **SOPORTE FUNDACIÓN**

━━━━━━━━━━━━━━━━━━

⚠️ Uso indebido = sanción.`)
                .setFooter({ text: "Sistema de Tickets • Los Santos RP" });

            // 📌 MENÚ
            const menu = new StringSelectMenuBuilder()
                .setCustomId("ticket_select")
                .setPlaceholder("Selecciona una categoría")
                .addOptions([
                    {
                        label: "Soporte General",
                        value: "soporte",
                        emoji: "1463940895698325708"
                    },
                    {
                        label: "Reportar Usuario",
                        value: "usuario",
                        emoji: "1463940988530589902"
                    },
                    {
                        label: "Reportar Staff",
                        value: "staff",
                        emoji: "1463941230294597773"
                    },
                    {
                        label: "Alianza",
                        value: "alianza",
                        emoji: "1463941043870371891"
                    },
                    {
                        label: "Soporte Fundación",
                        value: "fundacion",
                        emoji: "1463941136229077033"
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(menu);

            // 🧹 OPCIONAL: BORRAR MENSAJES ANTERIORES
            const mensajes = await canal.messages.fetch({ limit: 10 });
            await canal.bulkDelete(mensajes);

            // 📤 ENVIAR PANEL
            await canal.send({
                embeds: [embed],
                components: [row]
            });

            console.log("✅ Panel de tickets enviado automáticamente");

        } catch (error) {
            console.log("❌ Error enviando panel:", error);
        }

    });

};
