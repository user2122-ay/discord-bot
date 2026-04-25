const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

// 📢 Canal donde se avisa al staff
const CANAL_AVISO = "1455970934535225518";

module.exports = (client) => {

    client.on("messageCreate", async (message) => {

        if (message.author.bot) return;

        // 🔥 Detectar mención al bot
        if (!message.mentions.has(client.user)) return;

        // 📌 EMBED
        const embed = new EmbedBuilder()
            .setColor("#2c2f33")
            .setTitle("🤖┃Soporte Automático")
            .setDescription(`Hola <@${message.author.id}>, ¿en qué puedo ayudarte?

━━━━━━━━━━━━━━━━━━

❓ Dudas generales  
🎫 Crear ticket  
📜 Normativa  
📘 Conceptos RP  
🟢 Estado del servidor  
💬 Hablar con staff  

━━━━━━━━━━━━━━━━━━`)
            .setFooter({ text: "Sistema de Soporte • Velaryon RP" });

        // 📌 MENÚ
        const menu = new StringSelectMenuBuilder()
            .setCustomId("menu_soporte")
            .setPlaceholder("Selecciona una opción")
            .addOptions([
                { label: "Dudas generales", value: "dudas", emoji: "❓" },
                { label: "Crear ticket", value: "ticket", emoji: "🎫" },
                { label: "Normativa", value: "normas", emoji: "📜" },
                { label: "Conceptos RP", value: "rp", emoji: "📘" },
                { label: "Estado del servidor", value: "estado", emoji: "🟢" },
                { label: "Hablar con staff", value: "staff", emoji: "💬" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await message.reply({
            embeds: [embed],
            components: [row]
        });

    });

    // 🎯 INTERACCIONES
    client.on("interactionCreate", async interaction => {

        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "menu_soporte") return;

        const opcion = interaction.values[0];

        if (opcion === "dudas") {
            return interaction.reply({
                content: "❓ Escribe tu duda y el staff te responderá.",
                ephemeral: true
            });
        }

        if (opcion === "ticket") {
            return interaction.reply({
                content: "🎫 Tickets aquí:\nhttps://discord.com/channels/1463192289974157334/1463192291211477008",
                ephemeral: true
            });
        }

        if (opcion === "normas") {
            return interaction.reply({
                content: "📜 Normativa:\nhttps://discord.com/channels/1463192289974157334/1463192291056423017",
                ephemeral: true
            });
        }

        if (opcion === "rp") {
            return interaction.reply({
                content: "📘 Conceptos RP:\nhttps://discord.com/channels/1463192289974157334/1463192291056423019",
                ephemeral: true
            });
        }

        if (opcion === "estado") {
            return interaction.reply({
                content: "🟢 Estado del servidor:\nhttps://discord.com/channels/1463192289974157334/1463192291056423024",
                ephemeral: true
            });
        }

        if (opcion === "staff") {

            const canal = interaction.guild.channels.cache.get(CANAL_AVISO);

            if (canal) {
                canal.send({
                    content: `🚨 <@${interaction.user.id}> necesita ayuda. Fue desde mención al bot.<@&1463192290423083324>`
                });
            }

            return interaction.reply({
                content: "💬 Se ha notificado al staff.",
                ephemeral: true
            });
        }

    });

};
