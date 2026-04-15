const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const CANAL_ID = "1463192291211477008";

module.exports = (client) => {

    client.once("ready", async () => {

        const canal = client.channels.cache.get(CANAL_ID);
        if (!canal) return console.log("❌ Canal no encontrado");

        const embed = new EmbedBuilder()
            .setColor("#2c2f33")
            .setTitle("🎫┃SISTEMA DE TICKETS")
            .setDescription(`Bienvenido/a al **Sistema Oficial de Atención y Soporte** de **Los Santos Spanish RP**.

Este panel ha sido creado para garantizar una gestión **ordenada, confidencial y eficiente** de todas las solicitudes de la comunidad.

Seleccione cuidadosamente la categoría que mejor se ajuste a su situación.
Un miembro del **staff autorizado** atenderá su ticket a la mayor brevedad posible.

━━━━━━━━━━━━━━━━━━

📌 **Categorías Disponibles**

<:moderador:1463940895698325708> **SOPORTE GENERAL**  
Para consultas generales, errores técnicos o problemas dentro del servidor.

<:admind:1463940988530589902> **REPORTAR USUARIO**  
Para reportar conductas inapropiadas con pruebas válidas.

<:emoji_5:1463941230294597773> **REPORTAR STAFF**  
Para reportes internos con total confidencialidad.

<a:Alianza:1463941043870371891> **ALIANZA**  
Para acuerdos entre comunidades.

<:owner:1463941136229077033> **SOPORTE FUNDACIÓN**  
Para asuntos directos con Owners.

━━━━━━━━━━━━━━━━━━

⚠️ **Importante:**  
El uso indebido del sistema podrá resultar en sanciones.`);

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_select") // 🔥 IMPORTANTE
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

        await canal.send({
            embeds: [embed],
            components: [row]
        });

        console.log("✅ Panel de tickets enviado automáticamente");

    });

};
